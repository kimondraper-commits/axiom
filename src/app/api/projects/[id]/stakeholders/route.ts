import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stakeholders = await db.projectStakeholder.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ data: stakeholders });
}

const stakeholderSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  organisation: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = stakeholderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stakeholder = await db.projectStakeholder.create({
    data: { ...parsed.data, projectId: id },
  });

  return NextResponse.json({ data: stakeholder }, { status: 201 });
}
