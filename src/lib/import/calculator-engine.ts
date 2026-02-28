import type { CalcSummary } from "./types";
import { ABS_AVG_HOUSEHOLD_SIZE, FTE_PER_MILLION, RESIDENTIAL_FTE, COMMERCIAL_DENSITY_M2 } from "@/lib/reference-data";

export function runAllCalculators(fields: {
  dwellings?: number;
  siteAreaHa?: number;
  constructionCostM?: number;
  commercialGfa?: number;
  greenSpaceHa?: number;
}): CalcSummary {
  const dw = fields.dwellings ?? 0;
  const siteHa = fields.siteAreaHa ?? 0;
  const costM = fields.constructionCostM ?? 0;
  const gfa = fields.commercialGfa ?? 0;
  const greenHa = fields.greenSpaceHa ?? 0;

  const population = Math.round(dw * ABS_AVG_HOUSEHOLD_SIZE);
  const popDensity = siteHa > 0 ? population / (siteHa / 100) : 0;
  const constructionFTEs = Math.round(costM * FTE_PER_MILLION);
  const ongoingJobs = Math.round(dw * RESIDENTIAL_FTE + gfa / COMMERCIAL_DENSITY_M2);

  let score = 0;
  if (popDensity > 5000) score += 25;
  else if (popDensity > 2000) score += 15;
  else if (popDensity > 500) score += 8;
  if (gfa > 0) score += 20;
  if (greenHa > 0 && siteHa > 0) score += Math.min(25, (greenHa / siteHa) * 100);
  if (dw > 0) score += 20;

  return {
    population,
    constructionFTEs,
    ongoingJobs,
    sustainabilityScore: Math.min(100, Math.round(score)),
  };
}
