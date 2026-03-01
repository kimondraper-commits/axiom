import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string; submissionId: string }> };

const patchSchema = z.object({
  status: z.enum(["pending", "reviewed", "addressed"]).optional(),
  response: z.string().optional(),
  keyIssues: z.string().optional(),
  supporting: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { submissionId } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const submission = await db.communitySubmission.update({
    where: { id: submissionId },
    data: parsed.data,
  });

  return NextResponse.json({ data: submission });
}
