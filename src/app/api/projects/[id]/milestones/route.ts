import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const milestones = await db.timelineMilestone.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ data: milestones });
}

const milestoneSchema = z.object({
  name: z.string().min(1),
  milestoneStatus: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  completedDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Support bulk create (array)
  if (Array.isArray(body)) {
    const milestones = await db.timelineMilestone.createMany({
      data: body.map((m: { name: string; sortOrder?: number }) => ({
        projectId: id,
        name: m.name,
        sortOrder: m.sortOrder ?? 0,
        milestoneStatus: "upcoming",
      })),
    });
    return NextResponse.json({ data: milestones }, { status: 201 });
  }

  const parsed = milestoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const milestone = await db.timelineMilestone.create({
    data: { ...parsed.data, projectId: id },
  });

  return NextResponse.json({ data: milestone }, { status: 201 });
}
