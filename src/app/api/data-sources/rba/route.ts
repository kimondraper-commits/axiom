import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { fetchCPI } from "@/lib/data-sources";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const cpiData = await fetchCPI();

    let cpiAnnualChange: number | null = null;
    let latestCpi: number | null = null;
    if (cpiData.length >= 5) {
      const latest = cpiData[cpiData.length - 1].value;
      const yearAgo = cpiData[cpiData.length - 5].value; // quarterly, so -4 = 1 year ago
      latestCpi = latest;
      cpiAnnualChange = yearAgo > 0 ? Math.round(((latest - yearAgo) / yearAgo) * 1000) / 10 : null;
    }

    return NextResponse.json({
      data: {
        cpiAnnualChangePct: cpiAnnualChange,
        latestCpiIndex: latestCpi,
        latestCpiDate: cpiData.length > 0 ? cpiData[cpiData.length - 1].date : null,
      },
      meta: { source: "Reserve Bank of Australia (rba.gov.au)" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "RBA API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
