import { cachedFetch } from "./cache";

const TTL = 3_600; // 1 hour

interface DaRecord {
  applicationId: string;
  applicationType: string;
  developmentDescription: string;
  status: string;
  lodgementDate: string;
  determinationDate: string | null;
  council: string;
  suburb: string;
  address: string;
  estimatedCost: number | null;
}

/**
 * Search development applications from the NSW ePlanning API.
 * Free API key from api.nsw.gov.au.
 */
export async function searchDAs(params: {
  council?: string;
  suburb?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ applications: DaRecord[]; totalCount: number }> {
  const apiKey = process.env.NSW_EPLANNING_API_KEY;
  if (!apiKey) throw new Error("NSW_EPLANNING_API_KEY not configured");

  const qs = new URLSearchParams();
  if (params.council) qs.set("filters[CouncilName]", params.council);
  if (params.suburb) qs.set("filters[SuburbName]", params.suburb);
  if (params.fromDate) qs.set("filters[LodgementDateFrom]", params.fromDate);
  if (params.toDate) qs.set("filters[LodgementDateTo]", params.toDate);
  qs.set("PageNumber", String(params.page ?? 1));
  qs.set("PageSize", String(params.pageSize ?? 20));

  const url = `https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA?${qs}`;

  const cacheKey = `eplanning:${qs.toString()}`;
  const raw = await cachedFetch<{
    Application?: {
      ApplicationId: string;
      ApplicationType: string;
      DevelopmentDescription: string;
      ApplicationStatus: string;
      LodgementDate: string;
      DeterminationDate: string | null;
      Council: { CouncilName: string };
      Location?: { SuburbName: string; FullAddress: string }[];
      CostOfDevelopment: number | null;
    }[];
    TotalCount?: number;
  }>(cacheKey, url, { ttlSeconds: TTL });

  const applications = (raw.Application ?? []).map((a) => ({
    applicationId: a.ApplicationId,
    applicationType: a.ApplicationType,
    developmentDescription: a.DevelopmentDescription,
    status: a.ApplicationStatus,
    lodgementDate: a.LodgementDate,
    determinationDate: a.DeterminationDate,
    council: a.Council?.CouncilName ?? "",
    suburb: a.Location?.[0]?.SuburbName ?? "",
    address: a.Location?.[0]?.FullAddress ?? "",
    estimatedCost: a.CostOfDevelopment,
  }));

  return { applications, totalCount: raw.TotalCount ?? applications.length };
}
