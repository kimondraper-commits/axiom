import { redis } from "@/lib/redis";

const TTL = 3_600; // 1 hour
const API_URL =
  "https://api.apps1.nsw.gov.au/eplanning/data/v0/DAApplicationTracker";

interface DaRecord {
  applicationId: string;
  applicationType: string;
  developmentType: string;
  status: string;
  council: string;
  address: string;
  coordinates: [number, number] | null;
}

interface TrackerFeature {
  properties: {
    PLANNING_PORTAL_APP_NUMBER: string;
    APPLICATION_TYPE: string;
    TYPE_OF_DEVELOPMENT: string;
    STATUS: string;
    COUNCIL_NAME: string;
    FULL_ADDRESS: string;
  };
  geometry: { type: string; coordinates: [number, number] } | null;
}

interface TrackerResponse {
  features: TrackerFeature[];
  TotalCount: number;
  TotalPages: number;
}

/**
 * Search development applications via the NSW Planning Portal
 * DAApplicationTracker API (POST, JSON body, no API key required).
 */
export async function searchDAs(params: {
  council?: string;
  suburb?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ applications: DaRecord[]; totalCount: number }> {
  const body: Record<string, string | number> = {
    ApplicationStatus: "ALL",
    PageNumber: params.page ?? 1,
    PageSize: Math.min(params.pageSize ?? 20, 50),
  };

  if (params.council) body.CouncilDisplayName = params.council;
  if (params.suburb) body.SiteAddress = params.suburb;
  if (params.fromDate) body.LodgementDateFrom = params.fromDate;
  if (params.toDate) body.LodgementDateTo = params.toDate;

  const cacheKey = `eplanning:${JSON.stringify(body)}`;

  // Try cache first
  try {
    const cached = await redis.get<TrackerResponse>(cacheKey);
    if (cached) return mapResponse(cached);
  } catch {
    // Redis unavailable
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`ePlanning API: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as TrackerResponse;

    // Cache (fire-and-forget)
    try {
      await redis.set(cacheKey, JSON.stringify(data), { ex: TTL });
    } catch {
      // Redis unavailable
    }

    return mapResponse(data);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function mapResponse(data: TrackerResponse): {
  applications: DaRecord[];
  totalCount: number;
} {
  const applications = (data.features ?? []).map((f) => ({
    applicationId: f.properties.PLANNING_PORTAL_APP_NUMBER,
    applicationType: f.properties.APPLICATION_TYPE ?? "",
    developmentType: f.properties.TYPE_OF_DEVELOPMENT ?? "",
    status: f.properties.STATUS ?? "",
    council: f.properties.COUNCIL_NAME ?? "",
    address: f.properties.FULL_ADDRESS ?? "",
    coordinates: f.geometry?.coordinates ?? null,
  }));

  return { applications, totalCount: data.TotalCount ?? applications.length };
}
