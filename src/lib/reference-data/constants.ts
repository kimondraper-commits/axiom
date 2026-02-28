/**
 * Centralised reference data for AXIOM calculators and analytics.
 *
 * Sources are cited inline. Values are NSW-specific unless noted.
 */

/* ------------------------------------------------------------------ */
/*  LGA-specific household sizes  (ABS Census 2021, Table G02)        */
/* ------------------------------------------------------------------ */
export const LGA_HOUSEHOLD_SIZE: Record<string, number> = {
  "Bayside":           2.72,
  "Blacktown":         3.08,
  "Blue Mountains":    2.40,
  "Camden":            3.10,
  "Campbelltown":      2.95,
  "Canada Bay":        2.58,
  "Canterbury-Bankstown": 2.97,
  "Central Coast":     2.50,
  "Cumberland":        3.12,
  "Fairfield":         3.20,
  "Georges River":     2.83,
  "Hornsby":           2.80,
  "Hunter's Hill":     2.62,
  "Inner West":        2.32,
  "Ku-ring-gai":       2.88,
  "Lake Macquarie":    2.45,
  "Lane Cove":         2.55,
  "Liverpool":         3.15,
  "Mosman":            2.42,
  "Newcastle":         2.30,
  "North Sydney":      1.95,
  "Northern Beaches":  2.70,
  "Parramatta":        2.65,
  "Penrith":           2.90,
  "Randwick":          2.45,
  "Ryde":              2.60,
  "Strathfield":       2.78,
  "Sutherland Shire":  2.75,
  "Sydney":            2.13,
  "The Hills Shire":   3.05,
  "Waverley":          2.25,
  "Willoughby":        2.55,
  "Wollondilly":       2.98,
  "Wollongong":        2.50,
  "Woollahra":         2.30,
};

/** State-wide average household size (ABS Census 2021). */
export const ABS_AVG_HOUSEHOLD_SIZE = 2.53;

/* ------------------------------------------------------------------ */
/*  LGA-specific growth rates  (DPE NSW Population Projections 2022)  */
/* ------------------------------------------------------------------ */
export const LGA_GROWTH_RATE_PCT: Record<string, number> = {
  "Blacktown":     2.1,
  "Camden":        3.5,
  "Campbelltown":  2.4,
  "Canterbury-Bankstown": 1.4,
  "Central Coast": 0.9,
  "Cumberland":    1.6,
  "Fairfield":     0.8,
  "Liverpool":     2.2,
  "Parramatta":    2.0,
  "Penrith":       1.8,
  "Sydney":        1.2,
  "The Hills Shire": 2.5,
  "Wollondilly":   2.8,
};

/** State-wide average annual growth rate (%). */
export const ABS_GROWTH_RATE_PCT = 1.5;

/* ------------------------------------------------------------------ */
/*  Economic constants                                                 */
/* ------------------------------------------------------------------ */

/** Full-time equivalent jobs per $1 M construction spend (ABS). */
export const FTE_PER_MILLION = 9;

/** Local ongoing-employment multiplier per dwelling (ABS / SGS). */
export const RESIDENTIAL_FTE = 0.35;

/** Commercial GFA per employee, m² (Property Council of Australia). */
export const COMMERCIAL_DENSITY_M2 = 25;

/** Annual retail spend per person, AUD (ABS Household Expenditure). */
export const RETAIL_SPEND_PER_PERSON = 18_000;

/** Average annual salary / GVA proxy, AUD (ABS Labour Force). */
export const AVG_SALARY = 95_000;

/* ------------------------------------------------------------------ */
/*  Environmental constants                                            */
/* ------------------------------------------------------------------ */

/** Residential CO₂-e per dwelling per year, tCO₂e (DCCEW National Greenhouse Accounts 2023). */
export const CO2E_RESIDENTIAL_PER_DW = 4.5;

/** Commercial CO₂-e per m² GFA per year, tCO₂e (DCCEW 2023). */
export const CO2E_COMMERCIAL_PER_M2 = 0.12;

/** Water demand per dwelling, ML/yr (180 L/person/day × ABS avg household). */
export const WATER_DEMAND_PER_DW_ML = 0.1665;

/** Runoff coefficient for impervious surfaces (MUSIC / ARR). */
export const RUNOFF_COEFFICIENT = 0.85;

/** Tree replacement ratio, NSW biodiversity offset standard. */
export const TREE_REPLACEMENT_RATIO = 3;

/** Default annual rainfall, mm (Sydney Observatory Hill average). */
export const DEFAULT_RAINFALL_MM = 700;

/* ------------------------------------------------------------------ */
/*  Sustainability constants                                           */
/* ------------------------------------------------------------------ */

/** Assumed average dwelling size for FSR calculation, m². */
export const DWELLING_SIZE_M2 = 120;

/** Reference density threshold for scoring, dw/ha. */
export const DENSITY_THRESHOLD_DW_HA = 150;

/* ------------------------------------------------------------------ */
/*  LGA-aware default helper                                           */
/* ------------------------------------------------------------------ */

export interface LgaDefaults {
  householdSize: number;
  growthRatePct: number;
}

/**
 * Return LGA-specific values if available, otherwise state averages.
 */
export function getDefaults(lga?: string | null): LgaDefaults {
  const key = lga?.trim() ?? "";
  return {
    householdSize: LGA_HOUSEHOLD_SIZE[key] ?? ABS_AVG_HOUSEHOLD_SIZE,
    growthRatePct: LGA_GROWTH_RATE_PCT[key] ?? ABS_GROWTH_RATE_PCT,
  };
}
