import { auth } from "@/lib/auth";
import { anthropic, buildSystemPrompt } from "@/lib/anthropic";
import type { SiteConstraints } from "@/lib/anthropic";
import { TOOLS, executeTool } from "@/lib/ai-tools";
import { aiRatelimit } from "@/lib/redis";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { MessageParam, ContentBlockParam } from "@anthropic-ai/sdk/resources/messages";

export const dynamic = "force-dynamic";

const MAX_TOOL_ROUNDS = 5;

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
      select: {
        title: true, city: true, district: true, status: true, phase: true,
        description: true, address: true, projectType: true, lga: true,
        dwellings: true, commercialGfa: true, buildingHeight: true, storeys: true,
        carParking: true, siteAreaHa: true, constructionCostM: true, greenSpaceHa: true,
        complianceItems: { where: { notes: { not: "" } }, select: { label: true, checked: true, notes: true } },
      },
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

  // Build the Anthropic messages array
  const anthropicMessages: MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Stream from Anthropic with tool-use loop
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";

      // Send sessionId as first chunk so the client can save it
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "session", sessionId: chatSessionId })}\n\n`)
      );

      try {
        let toolRound = 0;

        while (toolRound < MAX_TOOL_ROUNDS) {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: systemPrompt,
            messages: anthropicMessages,
            tools: TOOLS,
          });

          // Process response content blocks
          let hasToolUse = false;
          const assistantContent: ContentBlockParam[] = [];

          for (const block of response.content) {
            if (block.type === "text") {
              fullContent += block.text;
              assistantContent.push(block);
              // Stream the text to the client
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", text: block.text })}\n\n`)
              );
            } else if (block.type === "tool_use") {
              hasToolUse = true;
              assistantContent.push(block);

              // Notify client that a tool is being used
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "tool_use", tool: block.name, id: block.id })}\n\n`
                )
              );

              // Execute the tool
              const toolResult = await executeTool(
                block.name,
                block.input as Record<string, unknown>
              );

              // Notify client the tool finished
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "tool_result", tool: block.name, id: block.id })}\n\n`
                )
              );

              // Add assistant message and tool result to conversation
              anthropicMessages.push({ role: "assistant", content: assistantContent.slice() });
              anthropicMessages.push({
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: toolResult,
                  },
                ],
              });
            }
          }

          // If no tool use, we're done — the model gave a final text answer
          if (!hasToolUse) {
            break;
          }

          // If the last block was text after tool uses, we already streamed it.
          // If the model only returned tool_use blocks, loop to get the text response.
          toolRound++;
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
