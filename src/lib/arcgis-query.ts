/**
 * ArcGIS REST API query endpoint wrapper.
 * Used by AIM Site Finder to batch-query NSW planning layers.
 *
 * Unlike the `identify` endpoint (single-point), `query` supports:
 * - WHERE clauses for attribute filtering
 * - Bounding box geometry filters
 * - GeoJSON output format
 * - Up to 2000 results per request
 */

const EPI_BASE =
  "https://mapprod1.environment.nsw.gov.au/arcgis/rest/services/Planning";

export const LAYER_URLS = {
  zoning: `${EPI_BASE}/EPI_Primary_Planning_Layers/MapServer/2/query`,
  height: `${EPI_BASE}/EPI_Primary_Planning_Layers/MapServer/5/query`,
  fsr: `${EPI_BASE}/EPI_Primary_Planning_Layers/MapServer/1/query`,
  lotSize: `${EPI_BASE}/EPI_Primary_Planning_Layers/MapServer/4/query`,
  heritage: `${EPI_BASE}/EPI_Primary_Planning_Layers/MapServer/0/query`,
} as const;

export interface QueryParams {
  url: string;
  where?: string;
  bbox: [number, number, number, number]; // [west, south, east, north] in WGS84
  outFields?: string[];
  maxRecords?: number;
}

/**
 * Query an ArcGIS MapServer sublayer within a bounding box.
 * Returns a GeoJSON FeatureCollection.
 */
export async function queryArcGISLayer(
  params: QueryParams
): Promise<GeoJSON.FeatureCollection> {
  const { url, where, bbox, outFields, maxRecords } = params;
  const [west, south, east, north] = bbox;

  const geometry = JSON.stringify({
    xmin: west,
    ymin: south,
    xmax: east,
    ymax: north,
  });

  const searchParams = new URLSearchParams({
    where: where ?? "1=1",
    geometry,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    outSR: "4326",
    outFields: outFields?.join(",") ?? "*",
    returnGeometry: "true",
    f: "geojson",
    resultRecordCount: String(maxRecords ?? 2000),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${url}?${searchParams}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`[AIM] ArcGIS query failed: ${res.status} ${res.statusText}`);
      return { type: "FeatureCollection", features: [] };
    }

    const data = await res.json();

    // ArcGIS sometimes returns JSON errors even with 200
    if (data.error) {
      console.warn("[AIM] ArcGIS query error:", data.error);
      return { type: "FeatureCollection", features: [] };
    }

    return data as GeoJSON.FeatureCollection;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("[AIM] ArcGIS query timed out");
    } else {
      console.warn("[AIM] ArcGIS query failed:", err);
    }
    return { type: "FeatureCollection", features: [] };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Build a WHERE clause for zone code filtering.
 * e.g., ["R1", "R4", "B4"] → "SYM_CODE LIKE 'R1%' OR SYM_CODE LIKE 'R4%' OR SYM_CODE LIKE 'B4%'"
 */
export function buildZoneWhere(zones: string[]): string {
  if (zones.length === 0) return "1=1";
  return zones.map((z) => `SYM_CODE LIKE '${z}%'`).join(" OR ");
}

/**
 * Build WHERE for numeric comparison.
 * e.g., ("MAX_B_H", ">=", 12) → "MAX_B_H >= 12"
 */
export function buildNumericWhere(
  field: string,
  op: ">=" | "<=" | ">" | "<" | "=",
  value: number
): string {
  return `${field} ${op} ${value}`;
}
