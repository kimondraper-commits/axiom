import { cachedFetch } from "./cache";

const TTL = 86_400; // 24 hours

interface ThreatenedSpecies {
  scientificName: string;
  commonName: string;
  nswStatus: string;
  cwlthStatus: string;
  kingdom: string;
}

/**
 * Fetch threatened species records from BioNet OData API.
 * Queries by bounding box around a point. No authentication required.
 */
export async function fetchThreatenedSpecies(
  lat: number,
  lng: number,
  radiusKm = 5
): Promise<ThreatenedSpecies[]> {
  const delta = radiusKm / 111; // rough degree offset
  const minLat = lat - delta;
  const maxLat = lat + delta;
  const minLng = lng - delta;
  const maxLng = lng + delta;

  const filter = encodeURIComponent(
    `Latitude ge ${minLat} and Latitude le ${maxLat} and Longitude ge ${minLng} and Longitude le ${maxLng} and (NSWStatus ne '' or CwlthStatus ne '')`
  );

  const url =
    `https://data.bionet.nsw.gov.au/biosvcapp/odata/SpeciesSightings_CoreData?$filter=${filter}&$top=100&$select=ScientificName,VernacularName,NSWStatus,CwlthStatus,Kingdom`;

  const cacheKey = `bionet:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
  const raw = await cachedFetch<{
    value?: {
      ScientificName: string;
      VernacularName: string;
      NSWStatus: string;
      CwlthStatus: string;
      Kingdom: string;
    }[];
  }>(cacheKey, url, { ttlSeconds: TTL });

  // Deduplicate by scientific name
  const seen = new Set<string>();
  const results: ThreatenedSpecies[] = [];
  for (const r of raw.value ?? []) {
    if (seen.has(r.ScientificName)) continue;
    seen.add(r.ScientificName);
    results.push({
      scientificName: r.ScientificName,
      commonName: r.VernacularName,
      nswStatus: r.NSWStatus,
      cwlthStatus: r.CwlthStatus,
      kingdom: r.Kingdom,
    });
  }

  return results;
}
