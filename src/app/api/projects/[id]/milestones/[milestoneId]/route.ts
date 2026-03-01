import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string; milestoneId: string }> };

const patchSchema = z.object({
  milestoneStatus: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  completedDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
  name: z.string().min(1).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { milestoneId } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const milestone = await db.timelineMilestone.update({
    where: { id: milestoneId },
    data: parsed.data,
  });

  return NextResponse.json({ data: milestone });
}
