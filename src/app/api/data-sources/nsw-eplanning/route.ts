import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { searchDAs } from "@/lib/data-sources";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const council = searchParams.get("council") ?? undefined;
  const suburb = searchParams.get("suburb") ?? searchParams.get("address") ?? undefined;
  const fromDate = searchParams.get("fromDate") ?? undefined;
  const toDate = searchParams.get("toDate") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "20"), 50);

  try {
    const result = await searchDAs({ council, suburb, fromDate, toDate, page, pageSize });
    return NextResponse.json({
      data: result.applications,
      meta: {
        totalCount: result.totalCount,
        page,
        pageSize,
        source: "NSW Planning Portal DAApplicationTracker API",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ePlanning API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
