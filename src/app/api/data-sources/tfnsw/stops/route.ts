import { NextResponse } from "next/server";
import { fetchTrainStations } from "@/lib/data-sources";

// Public endpoint — Mapbox fetches this client-side without auth.
// Train station data is publicly published by TfNSW.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const geojson = await fetchTrainStations();
    return NextResponse.json(geojson, {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TfNSW API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
