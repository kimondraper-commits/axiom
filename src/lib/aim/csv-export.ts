/**
 * Convert AIM search results (GeoJSON FeatureCollection) to CSV.
 */

import Papa from "papaparse";

export function featuresToCSV(fc: GeoJSON.FeatureCollection): string {
  if (fc.features.length === 0) return "";

  const rows = fc.features.map((f) => {
    const props = f.properties ?? {};
    const centroid = getCentroid(f);

    return {
      zone: props.SYM_CODE ?? props.zone ?? "",
      zoneClass: props.LAY_CLASS ?? props.zoneClass ?? "",
      lga: props.LGA_NAME ?? props.lga ?? "",
      epiName: props.EPI_NAME ?? props.epiName ?? "",
      maxHeight: props.MAX_B_H ?? props.maxHeight ?? "",
      fsr: props.FSR ?? props.fsr ?? "",
      nearestStation: props.nearestStation ?? "",
      stationDistKm: props.stationDistKm ?? "",
      longitude: centroid?.[0] ?? "",
      latitude: centroid?.[1] ?? "",
    };
  });

  return Papa.unparse(rows);
}

function getCentroid(feature: GeoJSON.Feature): [number, number] | null {
  try {
    const geom = feature.geometry;
    if (geom.type === "Point") return geom.coordinates as [number, number];
    if (geom.type === "Polygon") {
      const ring = geom.coordinates[0];
      const n = ring.length;
      let x = 0,
        y = 0;
      for (const [cx, cy] of ring) {
        x += cx;
        y += cy;
      }
      return [x / n, y / n];
    }
    return null;
  } catch {
    return null;
  }
}
