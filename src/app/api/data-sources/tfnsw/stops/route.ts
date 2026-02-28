import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { fetchTrainStations } from "@/lib/data-sources";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const geojson = await fetchTrainStations();
    return NextResponse.json(geojson);
  } catch (err) {
    const message = err instanceof Error ? err.message : "TfNSW API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
