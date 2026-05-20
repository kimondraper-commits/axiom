import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searches = await db.aimSearch.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: searches });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const search = await db.aimSearch.findUnique({ where: { id } });
  if (!search || search.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.aimSearch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
