import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string; stakeholderId: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const { stakeholderId } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.projectStakeholder.delete({ where: { id: stakeholderId } });

  return NextResponse.json({ data: { deleted: true } });
}
