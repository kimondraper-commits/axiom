import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SIX_PROPERTY_SALE =
  "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/PropertySale/MapServer";

/**
 * GET /api/maps/valuations?lng=...&lat=...
 * Returns NSW land valuation data from SIX Maps PropertySale service.
 * Note: This is assessed land VALUES, not actual sale prices.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const lat = parseFloat(searchParams.get("lat") ?? "");

  if (isNaN(lng) || isNaN(lat)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const delta = 0.001;
  const geometry = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const url = `${SIX_PROPERTY_SALE}/identify?geometry=${geometry}&geometryType=esriGeometryEnvelope&sr=4326&layers=all&tolerance=5&mapExtent=${geometry}&imageDisplay=256,256,96&returnGeometry=false&f=json`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ data: null });
    }

    const data = await res.json();
    const results = data.results ?? [];

    if (results.length === 0) {
      return NextResponse.json({ data: null });
    }

    // Extract valuation attributes from first result
    const attrs = results[0].attributes ?? {};

    // SIX Maps PropertySale has val1_lv through val5_lv (land values by year)
    const valuations: { year: string; landValue: string }[] = [];
    for (let i = 1; i <= 5; i++) {
      const lvKey = `val${i}_lv`;
      const dateKey = `val${i}_bv_date`;
      if (attrs[lvKey] !== undefined && attrs[lvKey] !== null) {
        valuations.push({
          year: attrs[dateKey] ?? `Valuation ${i}`,
          landValue: typeof attrs[lvKey] === "number"
            ? `$${attrs[lvKey].toLocaleString()}`
            : String(attrs[lvKey]),
        });
      }
    }

    return NextResponse.json({
      data: {
        address: attrs.address ?? attrs.ADDRESS ?? null,
        zone: attrs.zone ?? attrs.ZONE ?? null,
        area: attrs.area_m2 ?? attrs.AREA ?? null,
        propertyType: attrs.property_type ?? attrs.PROPERTY_TYPE ?? null,
        valuations,
      },
    });
  } catch (err) {
    console.error("[Valuations] Query failed:", err);
    return NextResponse.json({ data: null });
  }
}
