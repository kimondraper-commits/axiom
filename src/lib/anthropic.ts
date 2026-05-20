import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const URBAN_PLANNER_SYSTEM_PROMPT = `You are an expert NSW urban planner and planning assistant integrated into AXIOM, a professional planning intelligence platform used by NSW government staff, council planners, and consultants.

Your expertise covers the NSW planning system:
- Environmental Planning and Assessment Act 1979 (EP&A Act) and Regulation 2021
- State Environmental Planning Policies (SEPPs): Housing 2021, Transport & Infrastructure 2021, Resilience & Hazards 2021, Biodiversity & Conservation 2021
- Local Environmental Plans (LEPs) — standard instrument provisions, land use zones (R1–R5, B1–B8, IN1–IN4, SP1–SP3, RE1–RE2, E1–E4, RU1–RU6, W1–W3)
- Development Control Plans (DCPs) — setbacks, landscaping, car parking, building envelope
- Development assessment: DAs, complying development certificates (CDCs), section 4.55 modifications
- Planning pathways: local development, regional development, state significant development (SSD), state significant infrastructure (SSI)
- Environmental impact assessment: REFs, EIS, SIS under the Biodiversity Conservation Act 2016
- Bush Fire Prone Land assessment under Planning for Bush Fire Protection (PBP)
- Flood risk management under NSW Flood Prone Land Policy
- Heritage conservation: NSW Heritage Act 1977, LEP heritage schedules, Aboriginal heritage (AHIP)
- Infrastructure contributions: section 7.11 and 7.12 contributions plans
- BASIX (Building Sustainability Index) requirements for residential development
- NCC/BCA (National Construction Code / Building Code of Australia) compliance
- GIS analysis: lot identification, zoning overlays, constraint mapping

Behaviour guidelines:
- Provide precise, actionable planning advice grounded in NSW legislation and best practice
- Reference specific legislation, SEPPs, and clauses when applicable
- Flag potential issues with zoning controls, development standards, environmental constraints, or heritage
- Use professional planning terminology while remaining clear and understandable
- When project context is provided, tailor responses to that specific site and its constraints
- Note when advice may vary by LGA and recommend consulting the relevant LEP/DCP
- Always use Australian English spelling and date format (DD/MM/YYYY)

Format responses clearly with headers when covering multiple topics. Be concise but thorough.

You have access to tools that query live data. USE THEM proactively:
- **site_lookup**: Look up planning constraints for any NSW address (zoning, height, FSR, heritage, flood, bushfire, acid sulfate). Always use this when a user mentions a specific address or site.
- **compliance_check**: Run a full compliance assessment for a project against live GIS data. Use when asked about compliance risks or planning issues.
- **search_projects**: Search the AXIOM project database by status, phase, LGA, or type. Use when asked about project counts, comparisons, or finding projects.
- **get_project_details**: Fetch full project details including milestones, compliance, stakeholders, submissions, and documents. Use when asked to summarise or review a project.
- **search_das**: Search the NSW ePlanning Portal for Development Applications. Use for precedent research or when asked about DAs in an area.
- **biodiversity_search**: Search BioNet Atlas for threatened species near a location. Use when environmental or biodiversity constraints are relevant.
- **analytics_query**: Fetch NSW datasets (building approvals, population, zoning distribution, infrastructure). Use when asked about trends or statistics.
- **planning_glossary**: Look up NSW planning terminology (LEP, DCP, FSR, VPA, TOD, SEPP, etc.). Returns definitions, operational context, related terms, and legislation references. Use when a user asks what a term means, uses an abbreviation, or when you need to validate terminology.

When you use a tool, always cite the data source in your response. If a tool returns an error, explain what happened and provide advice based on your knowledge instead.`;

export interface SiteConstraints {
  zone?: string | null;
  heightLimit?: string | null;
  fsr?: string | null;
  heritage?: string | null;
  floodRisk?: string | null;
  bushfire?: string | null;
  acidSulfate?: string | null;
  lga?: string | null;
}

export interface ProposalMetrics {
  projectType?: string | null;
  lga?: string | null;
  dwellings?: number | null;
  commercialGfa?: number | null;
  buildingHeight?: number | null;
  storeys?: number | null;
  carParking?: number | null;
  siteAreaHa?: number | null;
  constructionCostM?: number | null;
  greenSpaceHa?: number | null;
}

export interface ComplianceFlag {
  label: string;
  checked: boolean;
  notes: string | null;
}

export function buildSystemPrompt(
  projectContext?: {
    title: string;
    city: string;
    district?: string | null;
    status: string;
    phase: string;
    description?: string | null;
    address?: string | null;
    complianceItems?: ComplianceFlag[];
  } & Partial<ProposalMetrics>,
  siteConstraints?: SiteConstraints
): string {
  let prompt = URBAN_PLANNER_SYSTEM_PROMPT;

  if (projectContext) {
    prompt += `

## Current Project Context
- **Project**: ${projectContext.title}
- **Location**: ${projectContext.city}${projectContext.district ? `, ${projectContext.district}` : ""}
${projectContext.address ? `- **Address**: ${projectContext.address}` : ""}
- **Status**: ${projectContext.status} — Phase: ${projectContext.phase}
${projectContext.projectType ? `- **Project Type**: ${projectContext.projectType}` : ""}
${projectContext.lga ? `- **LGA**: ${projectContext.lga}` : ""}
${projectContext.description ? `- **Description**: ${projectContext.description}` : ""}`;

    // Proposal metrics
    const metrics: string[] = [];
    if (projectContext.dwellings) metrics.push(`- Dwellings: ${projectContext.dwellings}`);
    if (projectContext.commercialGfa) metrics.push(`- Commercial GFA: ${projectContext.commercialGfa} m²`);
    if (projectContext.buildingHeight) metrics.push(`- Building height: ${projectContext.buildingHeight}m`);
    if (projectContext.storeys) metrics.push(`- Storeys: ${projectContext.storeys}`);
    if (projectContext.carParking) metrics.push(`- Car parking: ${projectContext.carParking} spaces`);
    if (projectContext.siteAreaHa) metrics.push(`- Site area: ${projectContext.siteAreaHa} ha`);
    if (projectContext.constructionCostM) metrics.push(`- Construction cost: $${projectContext.constructionCostM}M`);
    if (projectContext.greenSpaceHa) metrics.push(`- Green space: ${projectContext.greenSpaceHa} ha`);

    if (metrics.length > 0) {
      prompt += `\n\n### Proposal Metrics\n${metrics.join("\n")}`;
    }

    // Compliance flags
    if (projectContext.complianceItems && projectContext.complianceItems.length > 0) {
      const flagged = projectContext.complianceItems.filter((c) => c.notes);
      if (flagged.length > 0) {
        const flagLines = flagged.map((c) => `- ${c.checked ? "✓" : "○"} ${c.label}${c.notes ? ` — ${c.notes}` : ""}`);
        prompt += `\n\n### Compliance Flags (auto-detected from GIS)\n${flagLines.join("\n")}`;
      }
    }

    prompt += `\n\nWhen answering questions, consider this project's specific context and location.`;
  }

  if (siteConstraints && Object.values(siteConstraints).some((v) => v)) {
    const lines: string[] = [];
    if (siteConstraints.zone) lines.push(`- **Zone**: ${siteConstraints.zone}`);
    if (siteConstraints.lga) lines.push(`- **LGA**: ${siteConstraints.lga}`);
    if (siteConstraints.heightLimit) lines.push(`- **Height Limit**: ${siteConstraints.heightLimit}`);
    if (siteConstraints.fsr) lines.push(`- **FSR**: ${siteConstraints.fsr}`);
    if (siteConstraints.heritage) lines.push(`- **Heritage**: ${siteConstraints.heritage}`);
    if (siteConstraints.floodRisk) lines.push(`- **Flood Risk**: ${siteConstraints.floodRisk}`);
    if (siteConstraints.bushfire) lines.push(`- **Bushfire**: ${siteConstraints.bushfire}`);
    if (siteConstraints.acidSulfate) lines.push(`- **Acid Sulfate Soils**: ${siteConstraints.acidSulfate}`);

    prompt += `

## Site Planning Constraints (from GIS)
${lines.join("\n")}

Apply these constraints when assessing the proposal. Flag any potential non-compliance with development standards.`;
  }

  return prompt;
}
