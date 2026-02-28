import { auth } from "@/lib/auth";
import { anthropic, buildSystemPrompt } from "@/lib/anthropic";
import type { SiteConstraints } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
  sessionId: z.string().optional(),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limiting
  const { success, limit, remaining } = await aiRatelimit.limit(session.user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before sending another message." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, sessionId, projectId } = parsed.data;
  const lastMessage = messages[messages.length - 1];

  // Fetch project context if provided
  let projectContext = undefined;
  let siteConstraints: SiteConstraints | undefined = undefined;

  if (projectId) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { title: true, city: true, district: true, status: true, phase: true, description: true, address: true },
    });
    if (project) {
      projectContext = {
        ...project,
        status: project.status as string,
        phase: project.phase as string,
      };

      // If project has an address, try to fetch site constraints from GIS
      if (project.address) {
        try {
          const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
          if (mapboxToken) {
            const geoRes = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(project.address)}.json?country=au&limit=1&access_token=${mapboxToken}`,
              { signal: AbortSignal.timeout(3000) }
            );
            const geoJson = await geoRes.json();
            const feature = geoJson.features?.[0];
            if (feature) {
              const [lng, lat] = feature.center as [number, number];
              const origin = req.headers.get("origin") ?? req.headers.get("host") ?? "localhost:3000";
              const protocol = origin.startsWith("http") ? "" : "http://";
              const parcelRes = await fetch(
                `${protocol}${origin}/api/maps/parcels?lng=${lng}&lat=${lat}`,
                {
                  signal: AbortSignal.timeout(5000),
                  headers: { cookie: req.headers.get("cookie") ?? "" },
                }
              );
              if (parcelRes.ok) {
                const parcelJson = await parcelRes.json();
                const d = parcelJson.data;
                if (d) {
                  siteConstraints = {
                    zone: d.zone,
                    heightLimit: d.heightLimit,
                    fsr: d.fsr,
                    heritage: d.heritage,
                    floodRisk: d.floodRisk,
                    bushfire: d.bushfire,
                    acidSulfate: d.acidSulfate,
                    lga: d.lga,
                  };
                }
              }
            }
          }
        } catch {
          // GIS lookup failed — continue without constraints
        }
      }
    }
  }

  const systemPrompt = buildSystemPrompt(projectContext, siteConstraints);

  // Ensure or create chat session
  let chatSessionId = sessionId;
  if (!chatSessionId) {
    const chatSession = await db.chatSession.create({
      data: {
        userId: session.user.id,
        projectId: projectId ?? null,
        title: lastMessage.content.slice(0, 60),
      },
    });
    chatSessionId = chatSession.id;
  }

  // Persist the user message
  await db.chatMessage.create({
    data: {
      sessionId: chatSessionId,
      role: "user",
      content: lastMessage.content,
    },
  });

  // Stream from Anthropic
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";

      // Send sessionId as first chunk so the client can save it
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "session", sessionId: chatSessionId })}\n\n`)
      );

      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullContent += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
            );
          }
        }

        // Persist assistant response
        await db.chatMessage.create({
          data: {
            sessionId: chatSessionId!,
            role: "assistant",
            content: fullContent,
          },
        });

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      } catch (err) {
        console.error("Anthropic stream error:", err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: "AI service error" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
