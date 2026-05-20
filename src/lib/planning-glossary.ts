/**
 * AXIOM Tool: Planning Glossary / Term Resolution
 * ================================================
 * Shared utility available to ALL agents in the pipeline.
 * Resolves planning terminology to definitions + operational context.
 *
 * Usage:
 *   - Any agent calls this when encountering planning terms in user queries
 *   - Reviewer agent uses it to validate terminology in outputs
 *   - Returns both the textbook definition AND practical significance
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TermCategory =
  | "planning_instrument"
  | "development_process"
  | "development_control"
  | "contribution_mechanism"
  | "strategic_planning"
  | "governance_authority"
  | "heritage"
  | "environment";

export type Jurisdiction = "state" | "local" | "both";

export interface PlanningTerm {
  abbreviation: string;
  full_name: string;
  category: TermCategory;
  jurisdiction: Jurisdiction;
  definition: string;
  operational_context: string;
  related_terms: string[];
  legislation_reference: string | null;
  example_in_use: string | null;
}

// ---------------------------------------------------------------------------
// Seed Glossary — sourced from Bayside interview prep docs
// ---------------------------------------------------------------------------

const GLOSSARY: PlanningTerm[] = [
  {
    abbreviation: "LEP",
    full_name: "Local Environmental Plan",
    category: "planning_instrument",
    jurisdiction: "local",
    definition:
      "The principal legal planning instrument for a local government area. " +
      "Sets zoning, maximum building heights, floor space ratios, heritage listings, " +
      "and other enforceable development standards.",
    operational_context:
      "Every DA is assessed against the LEP first. If a proposal doesn't comply with " +
      "the LEP, it needs a variation (clause 4.6) or it gets refused. Councils that " +
      "merged (like Bayside) often consolidate multiple LEPs into one — Bayside LEP 2021 " +
      "replaced three separate LEPs.",
    related_terms: ["DCP", "SEPP", "LSPS", "FSR"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, Part 3",
    example_in_use:
      "Bayside LEP 2021 consolidated Rockdale LEP 2011, Botany Bay LEP 2013, " +
      "and Botany LEP 1995 into a single instrument.",
  },
  {
    abbreviation: "DCP",
    full_name: "Development Control Plan",
    category: "planning_instrument",
    jurisdiction: "local",
    definition:
      "Detailed design guidelines that sit under the LEP. Covers things like " +
      "setbacks, landscaping, parking rates, building materials, and amenity standards.",
    operational_context:
      "Unlike the LEP, DCPs are not legally binding — they're guidelines. But planners " +
      "assess DAs against the DCP and non-compliance needs justification. The DCP is " +
      "where the design detail lives.",
    related_terms: ["LEP", "DA", "setbacks"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, s4.15",
    example_in_use: null,
  },
  {
    abbreviation: "DA",
    full_name: "Development Application",
    category: "development_process",
    jurisdiction: "local",
    definition:
      "A formal application to council seeking consent to carry out development. " +
      "Assessed against the LEP, DCP, SEPPs, and s4.15 considerations.",
    operational_context:
      "DA assessment is the daily work of council planners. Involves checking compliance " +
      "with controls, assessing impacts (sunlight, noise, biodiversity, heritage), " +
      "managing exhibition/public submissions, and writing a determination report " +
      "recommending approval (with conditions) or refusal.",
    related_terms: ["LEP", "DCP", "SEPP", "exhibition", "consent_authority"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, Part 4",
    example_in_use:
      "Bayside reduced average DA processing from 182 days to 119 days (38% improvement) " +
      "through upfront completeness checks and earlier referrals.",
  },
  {
    abbreviation: "SEPP",
    full_name: "State Environmental Planning Policy",
    category: "planning_instrument",
    jurisdiction: "state",
    definition:
      "State-level planning policies that override or supplement local LEPs on specific " +
      "matters (e.g. housing, coastal management, infrastructure, exempt/complying development).",
    operational_context:
      "SEPPs take precedence over LEPs where there's a conflict. The Housing SEPP is " +
      "particularly significant right now — it enables TOD densities near stations " +
      "that can override local height/FSR controls.",
    related_terms: ["LEP", "TOD", "complying_development"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, Part 3",
    example_in_use:
      "Housing SEPP enables up to 6 storeys within 400m of Rockdale and Banksia stations, " +
      "overriding Bayside LEP height controls in those precincts.",
  },
  {
    abbreviation: "FSR",
    full_name: "Floor Space Ratio",
    category: "development_control",
    jurisdiction: "both",
    definition:
      "The ratio of total gross floor area of a building to the total site area. " +
      "Controls the bulk and density of development.",
    operational_context:
      "A higher FSR means a bigger building relative to the land. FSR is set in the LEP " +
      "and is one of the primary controls planners check. FSR interacts with height limits " +
      "and setbacks to shape building form. Variations require clause 4.6 justification.",
    related_terms: ["LEP", "height_limit", "setbacks", "clause_4_6"],
    legislation_reference: "Standard Instrument LEP, clause 4.4",
    example_in_use: null,
  },
  {
    abbreviation: "VPA",
    full_name: "Voluntary Planning Agreement",
    category: "contribution_mechanism",
    jurisdiction: "both",
    definition:
      "A negotiated agreement between a developer and a planning authority (council or state) " +
      "where the developer provides public benefits in exchange for planning approval.",
    operational_context:
      "VPAs can deliver infrastructure, affordable housing, community facilities, or monetary " +
      "contributions beyond what standard s7.11/s7.12 levies would capture. They're common " +
      "in major rezonings and precinct plans. The negotiation is complex — planners need to " +
      "ensure public benefit without appearing to 'sell' planning outcomes.",
    related_terms: ["s7.11", "s7.12", "affordable_housing"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, s7.4",
    example_in_use:
      "Bayside's new Arncliffe Community Hub is being delivered via a VPA — " +
      "developer funds the facility in exchange for development concessions.",
  },
  {
    abbreviation: "TOD",
    full_name: "Transport Oriented Development",
    category: "strategic_planning",
    jurisdiction: "state",
    definition:
      "A planning approach that concentrates housing density near public transport nodes " +
      "(primarily train stations) to reduce car dependence and leverage existing infrastructure.",
    operational_context:
      "TOD is a major NSW Government policy driver right now. The Housing SEPP enables " +
      "increased densities within 400m and 800m of stations. Creates tension between state " +
      "housing targets and local amenity concerns (tree canopy, infrastructure capacity, " +
      "character). Councils like Bayside are navigating this daily.",
    related_terms: ["SEPP", "housing_target", "tree_canopy"],
    legislation_reference: "Housing SEPP 2021",
    example_in_use:
      "Rockdale, Banksia, and Arncliffe are Bayside's three TOD areas — " +
      "estimated 11,300 homes over 15 years under the Housing SEPP.",
  },
  {
    abbreviation: "LSPS",
    full_name: "Local Strategic Planning Statement",
    category: "planning_instrument",
    jurisdiction: "local",
    definition:
      "A 20-year strategic planning vision for an LGA that sets planning priorities " +
      "and explains how the council will implement the relevant District Plan.",
    operational_context:
      "The LSPS bridges state strategy (District Plans) and local implementation (LEP/DCP). " +
      "It's the document that says 'here's where we're heading and why.' Councils must " +
      "review it every 7 years. It guides LEP amendments and rezoning decisions.",
    related_terms: ["LEP", "district_plan", "community_strategic_plan"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, s3.9",
    example_in_use:
      "Bayside's LSPS 2020 sets 25 planning priorities aligned with the " +
      "Eastern City District Plan.",
  },
  {
    abbreviation: "complying_development",
    full_name: "Complying Development",
    category: "development_process",
    jurisdiction: "state",
    definition:
      "Development that is small-scale and meets all predetermined standards, " +
      "so it can be approved by a private certifier without a full DA to council.",
    operational_context:
      "Complying development is meant to fast-track simple proposals (e.g. house " +
      "alterations, small new dwellings) that clearly meet all controls. It reduces " +
      "council workload and speeds up approvals. Standards are set in the Codes SEPP. " +
      "If any control isn't met, it reverts to a full DA.",
    related_terms: ["DA", "SEPP", "certifier"],
    legislation_reference:
      "State Environmental Planning Policy (Exempt and Complying Development Codes) 2008",
    example_in_use: null,
  },
  {
    abbreviation: "exhibition",
    full_name: "Public Exhibition / Notification",
    category: "development_process",
    jurisdiction: "local",
    definition:
      "The public consultation period where a DA or planning proposal is put on display " +
      "and the community can make written submissions.",
    operational_context:
      "Exhibition is a legal requirement for certain development types. Planners must " +
      "consider all submissions in their assessment report. Managing community feedback " +
      "— especially on contentious proposals — is a core skill. Exhibition periods " +
      "are set by the Community Participation Plan.",
    related_terms: ["DA", "submission", "consent_authority"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, s4.15(1)(d)",
    example_in_use: null,
  },
  {
    abbreviation: "consent_authority",
    full_name: "Consent Authority",
    category: "governance_authority",
    jurisdiction: "both",
    definition:
      "The body with legal power to approve or refuse a development application. " +
      "For most DAs, the local council is the consent authority.",
    operational_context:
      "Consent authority determines who makes the final call. For small DAs, it's " +
      "council staff under delegation. For larger/controversial DAs, it goes to the " +
      "Local Planning Panel or council meeting. For state significant development, " +
      "the consent authority is the Minister or Independent Planning Commission.",
    related_terms: ["DA", "local_planning_panel", "IPC"],
    legislation_reference: "Environmental Planning and Assessment Act 1979, s4.5",
    example_in_use: null,
  },
  {
    abbreviation: "tree_canopy",
    full_name: "Urban Tree Canopy Cover",
    category: "environment",
    jurisdiction: "local",
    definition:
      "The percentage of an area covered by tree canopy when viewed from above. " +
      "A key indicator of urban liveability and environmental quality.",
    operational_context:
      "Tree canopy is one of the sharpest tensions in current NSW planning. " +
      "As density increases under TOD and housing targets, established trees get removed. " +
      "Planners must balance state housing mandates against local canopy targets. " +
      "Bayside's canopy is only 12.3% against a 30% benchmark — this tension is real.",
    related_terms: ["TOD", "housing_target", "DCP"],
    legislation_reference: null,
    example_in_use:
      "Bayside's 12.3% canopy coverage vs 30% target is a key tension " +
      "as TOD precincts deliver 11,300 new homes.",
  },
];

// ---------------------------------------------------------------------------
// Lookup indexes (built once at module load)
// ---------------------------------------------------------------------------

/** Exact match by abbreviation (case-insensitive) */
const byAbbreviation = new Map<string, PlanningTerm>(
  GLOSSARY.map((t) => [t.abbreviation.toLowerCase(), t]),
);

/** Exact match by full name (case-insensitive) */
const byFullName = new Map<string, PlanningTerm>(
  GLOSSARY.map((t) => [t.full_name.toLowerCase(), t]),
);

// ---------------------------------------------------------------------------
// Lookup logic
// ---------------------------------------------------------------------------

export interface TermLookupResult {
  matched_term: PlanningTerm | null;
  related_terms: PlanningTerm[];
  confidence: number;
}

/**
 * Resolve a planning term from a query string.
 * Tries exact abbreviation → exact full name → fuzzy substring match.
 */
export function lookupTerm(
  query: string,
  options?: { category_filter?: TermCategory; include_related?: boolean },
): TermLookupResult {
  const q = query.trim().toLowerCase();
  const includeRelated = options?.include_related ?? true;

  // 1. Exact abbreviation match
  let match = byAbbreviation.get(q) ?? null;
  let confidence = match ? 1.0 : 0;

  // 2. Exact full-name match
  if (!match) {
    match = byFullName.get(q) ?? null;
    confidence = match ? 0.95 : 0;
  }

  // 3. Substring / keyword match across abbreviation, full_name, definition
  if (!match) {
    const candidates = GLOSSARY.map((term) => {
      const fields = [
        term.abbreviation.toLowerCase(),
        term.full_name.toLowerCase(),
        term.definition.toLowerCase(),
      ].join(" ");
      const words = q.split(/\s+/);
      const hits = words.filter((w) => fields.includes(w)).length;
      return { term, score: hits / words.length };
    })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      match = candidates[0].term;
      confidence = Math.min(candidates[0].score * 0.8, 0.85);
    }
  }

  // Apply category filter
  if (match && options?.category_filter && match.category !== options.category_filter) {
    match = null;
    confidence = 0;
  }

  // Resolve related terms
  let related: PlanningTerm[] = [];
  if (match && includeRelated) {
    related = match.related_terms
      .map((abbr) => byAbbreviation.get(abbr.toLowerCase()) ?? null)
      .filter((t): t is PlanningTerm => t !== null);
  }

  return { matched_term: match, related_terms: related, confidence };
}

/**
 * Return all terms, optionally filtered by category.
 */
export function getAllTerms(category?: TermCategory): PlanningTerm[] {
  if (!category) return [...GLOSSARY];
  return GLOSSARY.filter((t) => t.category === category);
}

// ---------------------------------------------------------------------------
// AI tool execution (called from ai-tools.ts)
// ---------------------------------------------------------------------------

export function executeGlossaryLookup(input: Record<string, unknown>): string {
  const query = input.query as string | undefined;
  const categoryFilter = input.category_filter as TermCategory | undefined;
  const includeRelated = (input.include_related as boolean) ?? true;

  if (!query) {
    return JSON.stringify({ error: "query is required" });
  }

  const result = lookupTerm(query, {
    category_filter: categoryFilter,
    include_related: includeRelated,
  });

  return JSON.stringify({
    ...result,
    source: "AXIOM Planning Glossary (NSW EP&A Act, Standard Instrument LEP)",
  });
}
