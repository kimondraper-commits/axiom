import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { fetchThreatenedSpecies } from "@/lib/data-sources";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseInt(searchParams.get("radius") ?? "5");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Provide valid lat+lng" }, { status: 400 });
  }

  try {
    const species = await fetchThreatenedSpecies(lat, lng, radius);
    return NextResponse.json({
      data: species,
      meta: {
        count: species.length,
        lat,
        lng,
        radiusKm: radius,
        source: "BioNet Atlas OData API",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "BioNet API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
