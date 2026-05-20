import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { DaSnapshot, type DaSnapshotData } from "@/lib/reports/da-snapshot";
import React from "react";

export const dynamic = "force-dynamic";

/**
 * POST /api/reports/da-snapshot
 * Accepts DA search results, returns a PDF snapshot.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: DaSnapshotData;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const buffer = await renderToBuffer(
      React.createElement(DaSnapshot, { data }) as any
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="axiom-da-snapshot-${data.council.replace(/\s+/g, "-")}-${Date.now()}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[Reports] DA Snapshot PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
