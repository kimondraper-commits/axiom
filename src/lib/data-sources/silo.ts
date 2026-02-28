import { cachedFetch } from "./cache";

const TTL = 604_800; // 7 days

interface SiloRainfallDay {
  date: string;
  rainfall: number;
}

/**
 * Fetch daily rainfall from SILO (Scientific Information for Land Owners).
 * Free API key from longpaddock.qld.gov.au.
 */
export async function fetchRainfall(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<SiloRainfallDay[]> {
  const apiKey = process.env.SILO_API_KEY;
  if (!apiKey) throw new Error("SILO_API_KEY not configured");

  const url =
    `https://www.longpaddock.qld.gov.au/cgi-bin/silo/DataDrillDataset.php?` +
    `lat=${lat}&lon=${lng}&start=${startDate}&finish=${endDate}` +
    `&format=json&username=${apiKey}&password=api`;

  const raw = await cachedFetch<{
    data?: { date: string; daily_rain: number }[];
  }>(`silo:rain:${lat}:${lng}:${startDate}:${endDate}`, url, { ttlSeconds: TTL });

  return (raw.data ?? []).map((d) => ({
    date: d.date,
    rainfall: d.daily_rain,
  }));
}
