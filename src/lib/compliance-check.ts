/**
 * Compliance auto-flagging logic.
 * Evaluates GIS site constraints and determines which compliance items
 * should be flagged for attention based on actual risk indicators.
 */

interface SiteData {
  zone?: string | null;
  heightLimit?: string | null;
  fsr?: string | null;
  heritage?: string | null;
  floodRisk?: string | null;
  bushfire?: string | null;
  acidSulfate?: string | null;
  lga?: string | null;
}

interface ComplianceFlag {
  flagged: boolean;
  notes?: string;
}

const NOT_APPLICABLE_PATTERNS = [
  /not applicable/i,
  /^n\/a$/i,
  /no data/i,
  /^none$/i,
  /^null$/i,
  /not identified/i,
  /not listed/i,
  /no record/i,
];

function isRisk(value: string | null | undefined): boolean {
  if (!value) return false;
  return !NOT_APPLICABLE_PATTERNS.some((p) => p.test(value.trim()));
}

export function evaluateComplianceFlag(
  label: string,
  siteData: SiteData
): ComplianceFlag {
  const l = label.toLowerCase();

  if (l.includes("bushfire") && isRisk(siteData.bushfire)) {
    return { flagged: true, notes: `GIS: ${siteData.bushfire}` };
  }

  if (l.includes("flood") && isRisk(siteData.floodRisk)) {
    return { flagged: true, notes: `GIS: ${siteData.floodRisk}` };
  }

  if (l.includes("heritage") && !l.includes("aboriginal") && isRisk(siteData.heritage)) {
    return { flagged: true, notes: `GIS: ${siteData.heritage}` };
  }

  if (l.includes("contamination") && isRisk(siteData.acidSulfate)) {
    return { flagged: true, notes: `GIS: Acid Sulfate Soils — ${siteData.acidSulfate}` };
  }

  if (l.includes("height") && siteData.heightLimit) {
    return { flagged: false, notes: `GIS height limit: ${siteData.heightLimit}` };
  }

  if (l.includes("fsr") && siteData.fsr) {
    return { flagged: false, notes: `GIS FSR: ${siteData.fsr}` };
  }

  if (l.includes("zoning") && siteData.zone) {
    return { flagged: false, notes: `GIS zone: ${siteData.zone}` };
  }

  return { flagged: false };
}

export function buildComplianceItems(
  labels: string[],
  siteData: SiteData | null
): Array<{ label: string; sortOrder: number; flagged?: boolean; notes?: string }> {
  return labels.map((label, i) => {
    const item: { label: string; sortOrder: number; flagged?: boolean; notes?: string } = {
      label,
      sortOrder: i,
    };
    if (siteData) {
      const flag = evaluateComplianceFlag(label, siteData);
      if (flag.flagged) item.flagged = true;
      if (flag.notes) item.notes = flag.notes;
    }
    return item;
  });
}
