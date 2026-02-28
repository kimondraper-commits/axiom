import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      members: true,
      _count: { select: { documents: true, comments: true } },
    },
  });

  return NextResponse.json({ data: projects, meta: { total: projects.length } });
}

const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  city: z.string().min(1),
  district: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
  phase: z.enum(["INITIATION", "PLANNING", "DESIGN", "REVIEW", "APPROVAL", "IMPLEMENTATION", "CLOSEOUT"]).optional(),
  budget: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      ...parsed.data,
      members: {
        create: { userId: session.user.id, role: "PLANNER" },
      },
    },
  });

  return NextResponse.json({ data: project }, { status: 201 });
}
