import { cachedFetch } from "./cache";

const TTL = 3_600; // 1 hour

interface AirQualityReading {
  site: string;
  parameter: string;
  value: number;
  unit: string;
  date: string;
  aqi: string;
}

/**
 * Fetch current air quality readings from NSW DPIE Air Quality API.
 * No authentication required.
 */
export async function fetchAirQuality(): Promise<AirQualityReading[]> {
  const url = "https://data.airquality.nsw.gov.au/api/Data/get_Observations";
  const raw = await cachedFetch<{
    Readings?: {
      Site: string;
      Parameter: string;
      Value: number;
      Units: string;
      Date: string;
      AQI?: string;
    }[];
  }>("nsw-air:current", url, { ttlSeconds: TTL });

  return (raw.Readings ?? []).map((r) => ({
    site: r.Site,
    parameter: r.Parameter,
    value: r.Value,
    unit: r.Units,
    date: r.Date,
    aqi: r.AQI ?? "N/A",
  }));
}
