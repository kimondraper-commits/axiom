import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.complianceItem.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ data: items });
}

const itemSchema = z.object({
  label: z.string().min(1),
  checked: z.boolean().optional(),
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

  // Support bulk create (array) or single item
  if (Array.isArray(body)) {
    const items = await db.complianceItem.createMany({
      data: body.map((item: { label: string; sortOrder?: number }) => ({
        projectId: id,
        label: item.label,
        sortOrder: item.sortOrder ?? 0,
      })),
    });
    return NextResponse.json({ data: items }, { status: 201 });
  }

  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await db.complianceItem.create({
    data: { ...parsed.data, projectId: id },
  });

  return NextResponse.json({ data: item }, { status: 201 });
}
