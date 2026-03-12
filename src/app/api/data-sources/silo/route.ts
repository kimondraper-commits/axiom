import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { fetchRainfall } from "@/lib/data-sources";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Provide valid lat+lng" }, { status: 400 });
  }

  const now = new Date();
  const end = now.toISOString().slice(0, 10).replace(/-/g, "");
  const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  try {
    const days = await fetchRainfall(lat, lng, start, end);
    const totalMm = days.reduce((s, d) => s + d.rainfall, 0);
    const rainDays = days.filter((d) => d.rainfall > 0).length;
    const avgDaily = days.length > 0 ? totalMm / days.length : 0;

    return NextResponse.json({
      data: {
        annualRainfallMm: Math.round(totalMm),
        rainDays,
        avgDailyMm: Math.round(avgDaily * 10) / 10,
        periodDays: days.length,
      },
      meta: { lat, lng, start, end, source: "SILO — Queensland Government (longpaddock.qld.gov.au)" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SILO API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
