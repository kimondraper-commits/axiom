import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { SiteReport, type SiteReportData } from "@/lib/reports/site-report";
import React from "react";

export const dynamic = "force-dynamic";

/**
 * POST /api/reports/site
 * Accepts site/parcel data, returns a PDF.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: SiteReportData;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const buffer = await renderToBuffer(
      React.createElement(SiteReport, { data }) as any
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="axiom-site-report-${Date.now()}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[Reports] Site PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
