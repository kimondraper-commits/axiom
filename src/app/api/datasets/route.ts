import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET — list user's datasets */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const datasets = await db.userDataset.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ data: datasets });
}

/** POST — save a new dataset (GeoJSON body) */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, geoJson } = body;

  if (!name || !geoJson) {
    return NextResponse.json({ error: "Missing name or geoJson" }, { status: 400 });
  }

  const dataset = await db.userDataset.create({
    data: {
      userId: session.user.id!,
      name,
      geoJson: geoJson as any,
    },
  });

  return NextResponse.json({ data: dataset }, { status: 201 });
}

/** DELETE — remove a dataset */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const dataset = await db.userDataset.findUnique({ where: { id } });
  if (!dataset || dataset.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.userDataset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
