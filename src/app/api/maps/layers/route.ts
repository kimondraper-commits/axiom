import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const layers = await db.mapLayer.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ data: layers, meta: { total: layers.length } });
}

const layerSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  layerType: z.enum(["fill", "line", "circle", "symbol", "raster"]),
  sourceConfig: z.record(z.unknown()),
  layerConfig: z.record(z.unknown()),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = layerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const layer = await db.mapLayer.create({ data: parsed.data });
  return NextResponse.json({ data: layer }, { status: 201 });
}
