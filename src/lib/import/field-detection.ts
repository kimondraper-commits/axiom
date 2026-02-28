import type { ColumnSample, FieldMapping, DestinationGroup, ConfidenceLevel, RawRow } from "./types";

const FIELD_MAPPINGS: Record<string, { group: DestinationGroup; aliases: string[] }> = {
  title:             { group: "Projects", aliases: ["title", "project name", "project title", "da name", "development name", "name"] },
  address:           { group: "Projects", aliases: ["address", "site address", "street address", "property address", "location"] },
  city:              { group: "Projects", aliases: ["city", "suburb", "town", "locality"] },
  lga:               { group: "Projects", aliases: ["lga", "local government area", "council", "municipality"] },
  projectType:       { group: "Projects", aliases: ["project type", "development type", "type", "category"] },
  nswStatus:         { group: "Projects", aliases: ["status", "nsw status", "da status", "assessment status"] },
  applicantName:     { group: "Projects", aliases: ["applicant", "applicant name", "developer", "proponent"] },
  applicantEmail:    { group: "Projects", aliases: ["email", "applicant email", "contact email"] },
  lodgementDate:     { group: "Projects", aliases: ["lodgement date", "date lodged", "lodge date", "submission date"] },
  dwellings:         { group: "Projects", aliases: ["dwellings", "units", "apartments", "residential units", "lots"] },
  siteAreaHa:        { group: "Projects", aliases: ["site area", "area ha", "hectares", "land area", "site area ha"] },
  constructionCostM: { group: "Projects", aliases: ["construction cost", "cost m", "project cost", "cost ($m)", "capex", "estimated cost"] },
  greenSpaceHa:      { group: "Projects", aliases: ["green space", "open space", "green area", "park area", "landscaping"] },
  commercialGfa:     { group: "Projects", aliases: ["commercial gfa", "gfa", "gross floor area", "floor area", "commercial area"] },
  buildingHeight:    { group: "Projects", aliases: ["building height", "height", "max height", "height m", "height (m)"] },
  storeys:           { group: "Projects", aliases: ["storeys", "floors", "levels", "number of floors", "no. storeys"] },
  carParking:        { group: "Projects", aliases: ["car parking", "parking", "parking spaces", "car spaces", "carpark"] },
  latitude:          { group: "GIS Maps", aliases: ["lat", "latitude", "y", "y_coord", "northing"] },
  longitude:         { group: "GIS Maps", aliases: ["lng", "lon", "longitude", "x", "x_coord", "easting"] },
};

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function detectFields(samples: ColumnSample[]): FieldMapping[] {
  return samples.map((col) => {
    const normalised = col.header.toLowerCase().trim();

    for (const [fieldName, { group, aliases }] of Object.entries(FIELD_MAPPINGS)) {
      // Exact alias match → HIGH
      if (aliases.includes(normalised)) {
        return {
          sourceColumn: col.header,
          destinationField: fieldName,
          destinationGroup: group,
          confidence: "HIGH" as ConfidenceLevel,
          samples: col.samples,
        };
      }
    }

    for (const [fieldName, { group, aliases }] of Object.entries(FIELD_MAPPINGS)) {
      // Contains alias substring (≥ 4 chars) → MEDIUM
      for (const alias of aliases) {
        if (alias.length >= 4 && (normalised.includes(alias) || alias.includes(normalised))) {
          return {
            sourceColumn: col.header,
            destinationField: fieldName,
            destinationGroup: group,
            confidence: "MEDIUM" as ConfidenceLevel,
            samples: col.samples,
          };
        }
      }
    }

    for (const [fieldName, { group, aliases }] of Object.entries(FIELD_MAPPINGS)) {
      // Levenshtein distance ≤ 2 to any alias → LOW
      for (const alias of aliases) {
        if (levenshtein(normalised, alias) <= 2) {
          return {
            sourceColumn: col.header,
            destinationField: fieldName,
            destinationGroup: group,
            confidence: "LOW" as ConfidenceLevel,
            samples: col.samples,
          };
        }
      }
    }

    return {
      sourceColumn: col.header,
      destinationField: null,
      destinationGroup: "Skip" as DestinationGroup,
      confidence: "LOW" as ConfidenceLevel,
      samples: col.samples,
    };
  });
}

export function detectProjectCount(
  rows: RawRow[],
  mappings: FieldMapping[]
): { count: number; mode: "single" | "multi" } {
  const titleMapping = mappings.find((m) => m.destinationField === "title");
  if (!titleMapping) return { count: rows.length, mode: rows.length > 1 ? "multi" : "single" };

  const titles = new Set(
    rows.map((r) => r[titleMapping.sourceColumn]).filter(Boolean)
  );
  return {
    count: titles.size,
    mode: titles.size > 1 ? "multi" : "single",
  };
}

export const ALL_DESTINATION_FIELDS = Object.entries(FIELD_MAPPINGS).map(([field, { group }]) => ({
  field,
  group,
}));
