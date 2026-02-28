import { cachedFetch } from "./cache";

const TTL = 86_400; // 24 hours

interface RbaStatRow {
  date: string;
  value: number;
}

/**
 * Fetch CPI (Consumer Price Index) from the RBA Statistics API.
 * Series ID g1-GCPIAG = All groups CPI, quarterly.
 */
export async function fetchCPI(): Promise<RbaStatRow[]> {
  const url = "https://api.rba.gov.au/statistics/tables/g1/data";
  const raw = await cachedFetch<{ data: { observations: { date: string; value: string; seriesId: string }[] }[] }>(
    "rba:cpi",
    url,
    { ttlSeconds: TTL }
  );

  const series = raw.data?.flatMap((d) => d.observations) ?? [];
  return series
    .filter((o) => o.seriesId === "GCPIAG")
    .slice(-20)
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
}

/**
 * Fetch Producer Price Index from the RBA Statistics API.
 * Series ID g2-GPPIWGD = PPI final demand, quarterly.
 */
export async function fetchPPI(): Promise<RbaStatRow[]> {
  const url = "https://api.rba.gov.au/statistics/tables/g2/data";
  const raw = await cachedFetch<{ data: { observations: { date: string; value: string; seriesId: string }[] }[] }>(
    "rba:ppi",
    url,
    { ttlSeconds: TTL }
  );

  const series = raw.data?.flatMap((d) => d.observations) ?? [];
  return series
    .filter((o) => o.seriesId === "GPPIWGD")
    .slice(-20)
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
}
