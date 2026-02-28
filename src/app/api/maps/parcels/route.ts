import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const NSW_CADASTRE_URL =
  "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/Cadastre/MapServer/identify";
const NSW_PLANNING_URL =
  "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/identify";
const NSW_HERITAGE_URL =
  "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Heritage/MapServer/identify";
const NSW_BUSHFIRE_URL =
  "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Bush_Fire_Prone_Land/MapServer/identify";
const NSW_FLOOD_URL =
  "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EP_Flooding/MapServer/identify";
const NSW_ACID_SULFATE_URL =
  "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Acid_Sulfate_Soils/MapServer/identify";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const lat = parseFloat(searchParams.get("lat") ?? "");

  if (isNaN(lng) || isNaN(lat)) {
    return NextResponse.json({ error: "Provide valid lng+lat" }, { status: 400 });
  }

  // Small bounding box around the clicked point (~500m)
  const delta = 0.005;
  const mapExtent = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const imageDisplay = "800,600,96";
  const geometry = JSON.stringify({ x: lng, y: lat });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  function makeParams(returnGeometry: boolean) {
    return new URLSearchParams({
      geometry,
      geometryType: "esriGeometryPoint",
      sr: "4326",
      layers: "all",
      tolerance: "2",
      mapExtent,
      imageDisplay,
      returnGeometry: String(returnGeometry),
      f: "json",
    });
  }

  try {
    const [cadastreRes, planningRes, heritageRes, bushfireRes, floodRes, acidSulfateRes] =
      await Promise.allSettled([
        fetch(`${NSW_CADASTRE_URL}?${makeParams(true)}`, { signal: controller.signal }),
        fetch(`${NSW_PLANNING_URL}?${makeParams(false)}`, { signal: controller.signal }),
        fetch(`${NSW_HERITAGE_URL}?${makeParams(false)}`, { signal: controller.signal }),
        fetch(`${NSW_BUSHFIRE_URL}?${makeParams(false)}`, { signal: controller.signal }),
        fetch(`${NSW_FLOOD_URL}?${makeParams(false)}`, { signal: controller.signal }),
        fetch(`${NSW_ACID_SULFATE_URL}?${makeParams(false)}`, { signal: controller.signal }),
      ]);

    clearTimeout(timeout);

    type ArcGISResult = { layerName: string; attributes: Record<string, unknown>; geometry?: { rings: number[][][] } };

    function extractResults(settled: PromiseSettledResult<Response>): Promise<ArcGISResult[]> {
      if (settled.status !== "fulfilled" || !settled.value.ok) return Promise.resolve([]);
      return settled.value.json().then((j: { results?: ArcGISResult[] }) => j?.results ?? []);
    }

    const [cadastreResults, planningResults, heritageResults, bushfireResults, floodResults, acidSulfateResults] =
      await Promise.all([
        extractResults(cadastreRes),
        extractResults(planningRes),
        extractResults(heritageRes),
        extractResults(bushfireRes),
        extractResults(floodRes),
        extractResults(acidSulfateRes),
      ]);

    // -- Cadastre --
    let cadastreAttrs: Record<string, unknown> | null = null;
    let parcelGeometry: { type: string; coordinates: number[][][] } | null = null;
    if (cadastreResults.length > 0) {
      cadastreAttrs = cadastreResults[0].attributes;
      if (cadastreResults[0].geometry?.rings) {
        parcelGeometry = { type: "Polygon", coordinates: cadastreResults[0].geometry.rings };
      }
    }

    // -- Planning (zoning) --
    let zoneAttrs: Record<string, unknown> | null = null;
    let lga: string | null = null;
    let epi: string | null = null;
    let heightLimit: string | null = null;
    let fsr: string | null = null;
    if (planningResults.length > 0) {
      const zoneResult = planningResults.find((r) => r.layerName === "Land Zoning");
      if (zoneResult) zoneAttrs = zoneResult.attributes;
      const heightResult = planningResults.find((r) => r.layerName === "Height of Buildings");
      if (heightResult) heightLimit = (heightResult.attributes.LAY_CLASS as string) ?? null;
      const fsrResult = planningResults.find((r) => r.layerName === "Floor Space Ratio");
      if (fsrResult) fsr = (fsrResult.attributes.LAY_CLASS as string) ?? null;
      const withLga = planningResults.find((r) => r.attributes.LGA_NAME);
      const withEpi = planningResults.find((r) => r.attributes.EPI_NAME);
      lga = (withLga?.attributes.LGA_NAME as string) ?? null;
      epi = (withEpi?.attributes.EPI_NAME as string) ?? null;
    }

    // -- Heritage --
    let heritage: string | null = null;
    if (heritageResults.length > 0) {
      const item = heritageResults[0];
      heritage = (item.attributes.LAY_CLASS as string) ?? (item.attributes.ITEM_NAME as string) ?? item.layerName;
    }

    // -- Bushfire --
    let bushfire: string | null = null;
    if (bushfireResults.length > 0) {
      const item = bushfireResults[0];
      bushfire = (item.attributes.LAY_CLASS as string) ?? (item.attributes.CATEGORY as string) ?? item.layerName;
    }

    // -- Flood --
    let floodRisk: string | null = null;
    if (floodResults.length > 0) {
      const item = floodResults[0];
      floodRisk = (item.attributes.LAY_CLASS as string) ?? item.layerName;
    }

    // -- Acid Sulfate Soils --
    let acidSulfate: string | null = null;
    if (acidSulfateResults.length > 0) {
      const item = acidSulfateResults[0];
      acidSulfate = (item.attributes.LAY_CLASS as string) ?? item.layerName;
    }

    if (!cadastreAttrs && !zoneAttrs && !heritage && !bushfire && !floodRisk && !acidSulfate) {
      return NextResponse.json({ data: null });
    }

    const lotPlan = (cadastreAttrs?.lotidstring as string) ?? null;
    const rawArea = cadastreAttrs?.shape_Area;
    const lotArea = rawArea ? `${Math.round(parseFloat(String(rawArea)))} m²` : null;

    const zoneCode = zoneAttrs?.SYM_CODE as string | undefined;
    const zoneName = zoneAttrs?.LAY_CLASS as string | undefined;
    const zone = zoneCode && zoneName ? `${zoneCode} – ${zoneName}` : (zoneCode ?? zoneName ?? null);

    return NextResponse.json({
      data: {
        lotPlan,
        address: null,
        lotArea,
        lga: lga ? lga.replace(/\b\w/g, (c) => c.toUpperCase()) : null,
        zone: zone ?? null,
        epi: epi ?? null,
        heightLimit,
        fsr,
        heritage,
        bushfire,
        floodRisk,
        acidSulfate,
        geometry: parcelGeometry,
      },
    });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json({ data: null });
  }
}
