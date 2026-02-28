import { cachedFetch } from "./cache";

const TTL = 86_400; // 24 hours

interface AbsObservation {
  date: string;
  value: number;
}

/**
 * Fetch building approvals from ABS Data API.
 * Dataset: ABS_BA (Building Approvals), monthly, NSW (1 = New South Wales).
 */
export async function fetchBuildingApprovals(): Promise<AbsObservation[]> {
  const url =
    "https://api.data.abs.gov.au/data/ABS,ABS_BA,1.0.0/1.1+2.1..M?startPeriod=2022-01&dimensionAtObservation=AllDimensions&format=jsondata";
  const raw = await cachedFetch<{
    dataSets?: { observations?: Record<string, number[]> }[];
    structure?: { dimensions?: { observation?: { values: { id: string; name: string }[] }[] } };
  }>("abs:building-approvals", url, { ttlSeconds: TTL });

  const obs = raw.dataSets?.[0]?.observations ?? {};
  const timeDim = raw.structure?.dimensions?.observation?.find(
    (d) => d.values.some((v) => /^\d{4}-\d{2}$/.test(v.id))
  );

  if (!timeDim) return [];

  const results: AbsObservation[] = [];
  for (const [key, vals] of Object.entries(obs)) {
    const indices = key.split(":");
    const timeIdx = parseInt(indices[indices.length - 1]);
    const period = timeDim.values[timeIdx];
    if (period && vals[0] !== undefined) {
      results.push({ date: period.id, value: vals[0] });
    }
  }

  return results
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-24);
}

/**
 * Fetch Estimated Resident Population from ABS Data API.
 * Dataset: ABS_ERP_ASGS2021, annual, NSW (1).
 */
export async function fetchPopulation(): Promise<AbsObservation[]> {
  const url =
    "https://api.data.abs.gov.au/data/ABS,ABS_ERP_ASGS2021,1.0.0/1.1..A?startPeriod=2018&dimensionAtObservation=AllDimensions&format=jsondata";
  const raw = await cachedFetch<{
    dataSets?: { observations?: Record<string, number[]> }[];
    structure?: { dimensions?: { observation?: { values: { id: string; name: string }[] }[] } };
  }>("abs:population", url, { ttlSeconds: TTL });

  const obs = raw.dataSets?.[0]?.observations ?? {};
  const timeDim = raw.structure?.dimensions?.observation?.find(
    (d) => d.values.some((v) => /^\d{4}$/.test(v.id))
  );

  if (!timeDim) return [];

  const results: AbsObservation[] = [];
  for (const [key, vals] of Object.entries(obs)) {
    const indices = key.split(":");
    const timeIdx = parseInt(indices[indices.length - 1]);
    const period = timeDim.values[timeIdx];
    if (period && vals[0] !== undefined) {
      results.push({ date: period.id, value: vals[0] });
    }
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}
