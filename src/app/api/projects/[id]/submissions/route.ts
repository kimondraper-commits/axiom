import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submissions = await db.communitySubmission.findMany({
    where: { projectId: id },
    orderBy: { dateReceived: "desc" },
  });

  return NextResponse.json({ data: submissions });
}

const submissionSchema = z.object({
  submitterName: z.string().optional(),
  dateReceived: z.string().datetime().optional(),
  keyIssues: z.string().optional(),
  response: z.string().optional(),
  status: z.enum(["pending", "reviewed", "addressed"]).optional(),
  supporting: z.boolean().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const submission = await db.communitySubmission.create({
    data: { ...parsed.data, projectId: id },
  });

  return NextResponse.json({ data: submission }, { status: 201 });
}
