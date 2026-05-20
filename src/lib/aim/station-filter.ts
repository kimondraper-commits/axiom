/**
 * Filter GeoJSON features by proximity to NSW train stations.
 * Uses Turf.js for distance calculations.
 */

import * as turf from "@turf/turf";

interface StationPoint {
  name: string;
  lng: number;
  lat: number;
}

/**
 * Filter features to those whose centroid is within `maxDistKm` of any train station.
 * Also adds `nearestStation` and `stationDistKm` properties to each feature.
 */
export function filterByStationDistance(
  features: GeoJSON.Feature[],
  stations: StationPoint[],
  maxDistKm: number
): GeoJSON.Feature[] {
  if (stations.length === 0 || features.length === 0) return features;

  return features
    .map((feature) => {
      const centroid = turf.centroid(feature as any);
      const [lng, lat] = centroid.geometry.coordinates;

      let nearest = "";
      let minDist = Infinity;

      for (const station of stations) {
        const d = turf.distance(
          turf.point([lng, lat]),
          turf.point([station.lng, station.lat]),
          { units: "kilometers" }
        );
        if (d < minDist) {
          minDist = d;
          nearest = station.name;
        }
      }

      if (minDist > maxDistKm) return null;

      return {
        ...feature,
        properties: {
          ...feature.properties,
          nearestStation: nearest,
          stationDistKm: Math.round(minDist * 100) / 100,
        },
      };
    })
    .filter(Boolean) as GeoJSON.Feature[];
}

/**
 * Parse the hardcoded train station array into StationPoint format.
 */
export function parseStations(
  raw: [string, number, number][]
): StationPoint[] {
  return raw.map(([name, lng, lat]) => ({ name, lng, lat }));
}
