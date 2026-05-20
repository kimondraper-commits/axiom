/**
 * KML file parser. Converts KML → GeoJSON using @tmcw/togeojson,
 * then extracts rows using the same logic as parseGeoJSON.
 */

import { kml } from "@tmcw/togeojson";

export interface ParsedKML {
  rows: Record<string, string | number | null>[];
  headers: string[];
  rowCount: number;
  fileType: "kml";
  fileName: string;
  fileSizeBytes: number;
  geoJson: GeoJSON.FeatureCollection;
}

export async function parseKML(file: File): Promise<ParsedKML> {
  const text = await file.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");

  const fc = kml(xml) as GeoJSON.FeatureCollection;

  const rows: Record<string, string | number | null>[] = [];
  const headerSet = new Set<string>();

  for (const feature of fc.features) {
    const props = feature.properties ?? {};
    const row: Record<string, string | number | null> = {};

    // Copy all KML properties
    for (const [key, val] of Object.entries(props)) {
      if (val !== null && val !== undefined) {
        row[key] = typeof val === "object" ? JSON.stringify(val) : val;
        headerSet.add(key);
      }
    }

    // Extract coordinates
    const geom = feature.geometry;
    if (geom) {
      if (geom.type === "Point") {
        row.longitude = geom.coordinates[0];
        row.latitude = geom.coordinates[1];
        headerSet.add("longitude");
        headerSet.add("latitude");
      } else if (geom.type === "Polygon" || geom.type === "MultiPolygon") {
        row.geometry_type = geom.type;
        headerSet.add("geometry_type");
      }
    }

    rows.push(row);
  }

  return {
    rows,
    headers: Array.from(headerSet),
    rowCount: rows.length,
    fileType: "kml",
    fileName: file.name,
    fileSizeBytes: file.size,
    geoJson: fc,
  };
}
