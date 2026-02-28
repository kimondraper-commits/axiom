import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comments = await db.comment.findMany({
    where: { projectId: id, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      replies: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({ data: comments });
}

const commentSchema = z.object({
  body: z.string().min(1).max(5000),
  parentId: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await db.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const comment = await db.comment.create({
    data: {
      projectId: id,
      body: parsed.data.body,
      parentId: parsed.data.parentId,
      isPublic: parsed.data.isPublic ?? false,
      isApproved: session ? true : false, // authenticated comments auto-approved
      authorId: session?.user.id ?? null,
      authorName: session ? undefined : parsed.data.authorName,
      authorEmail: session ? undefined : parsed.data.authorEmail,
    },
  });

  return NextResponse.json({ data: comment }, { status: 201 });
}
