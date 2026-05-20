/**
 * Tool definitions and execution for the AXIOM AI assistant.
 * These tools let Claude query live data instead of guessing.
 */

import type { Tool, MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { db } from "@/lib/db";
import { searchDAs } from "@/lib/data-sources/nsw-eplanning";
import { fetchThreatenedSpecies } from "@/lib/data-sources/bionet";
import { fetchBuildingApprovals, fetchPopulation } from "@/lib/data-sources/abs";
import { evaluateComplianceFlag } from "@/lib/compliance-check";
import { executeGlossaryLookup } from "@/lib/planning-glossary";

// ---------------------------------------------------------------------------
// Tool definitions (sent to Anthropic)
// ---------------------------------------------------------------------------

export const TOOLS: Tool[] = [
  {
    name: "site_lookup",
    description:
      "Look up planning constraints for a site by address or coordinates. Returns zoning, height limit, FSR, heritage, flood risk, bushfire, and acid sulfate soils from NSW government GIS layers. Use this whenever a user asks about a specific site or address.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: {
          type: "string",
          description: "Street address to look up (e.g. '42 George St, Parramatta NSW')",
        },
        lng: { type: "number", description: "Longitude (if address not provided)" },
        lat: { type: "number", description: "Latitude (if address not provided)" },
      },
      required: [],
    },
  },
  {
    name: "compliance_check",
    description:
      "Run a compliance assessment for a project. Evaluates all compliance items against live GIS constraints and returns which items are flagged, with reasons. Use when a user asks about compliance risks or planning issues for a project.",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "The project ID to check compliance for",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "search_projects",
    description:
      "Search and filter projects in the AXIOM database. Returns project summaries matching the given filters. Use when a user asks about projects, project counts, or wants to find specific projects.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"],
          description: "Filter by project status",
        },
        phase: {
          type: "string",
          enum: ["INITIATION", "PLANNING", "DESIGN", "REVIEW", "APPROVAL", "IMPLEMENTATION", "CLOSEOUT"],
          description: "Filter by project phase",
        },
        lga: { type: "string", description: "Filter by Local Government Area name" },
        project_type: { type: "string", description: "Filter by project type" },
        query: { type: "string", description: "Free-text search across title and description" },
      },
      required: [],
    },
  },
  {
    name: "get_project_details",
    description:
      "Get full details for a specific project including milestones, compliance items, stakeholders, submissions, and documents. Use when a user asks for a project summary or detailed status.",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "The project ID to fetch",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "search_das",
    description:
      "Search NSW ePlanning Portal for Development Applications. Returns recent DAs matching the filters. Use when a user asks about DAs, development applications, or planning precedents in an area.",
    input_schema: {
      type: "object" as const,
      properties: {
        council: { type: "string", description: "Council name (e.g. 'City of Sydney')" },
        suburb: { type: "string", description: "Suburb or address to search near" },
        from_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
        to_date: { type: "string", description: "End date (YYYY-MM-DD)" },
      },
      required: [],
    },
  },
  {
    name: "biodiversity_search",
    description:
      "Search BioNet Atlas for threatened species near a location. Returns species records within a radius. Use when a user asks about biodiversity, threatened species, or environmental constraints near a site.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Address to search near (will be geocoded)" },
        lat: { type: "number", description: "Latitude (if address not provided)" },
        lng: { type: "number", description: "Longitude (if address not provided)" },
        radius_km: { type: "number", description: "Search radius in km (default 5)" },
      },
      required: [],
    },
  },
  {
    name: "analytics_query",
    description:
      "Fetch analytics datasets: building approvals, population trends, zoning distribution, or infrastructure projects. Use when a user asks about statistics, trends, or data for NSW.",
    input_schema: {
      type: "object" as const,
      properties: {
        dataset: {
          type: "string",
          enum: ["permits", "population", "zoning", "infrastructure"],
          description: "The dataset to query",
        },
      },
      required: ["dataset"],
    },
  },
  {
    name: "planning_glossary",
    description:
      "Look up NSW planning terminology. Returns the definition, operational context (why it matters in practice), related terms, and legislation reference. Use when a user asks what a planning term means, uses an abbreviation (LEP, DCP, FSR, VPA, TOD, SEPP, etc.), or when you need to validate terminology in a response.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "The term, abbreviation, or natural-language phrase to resolve (e.g. 'FSR', 'floor space ratio', 'what controls building size')",
        },
        category_filter: {
          type: "string",
          enum: [
            "planning_instrument",
            "development_process",
            "development_control",
            "contribution_mechanism",
            "strategic_planning",
            "governance_authority",
            "heritage",
            "environment",
          ],
          description: "Optionally narrow results to a specific category",
        },
        include_related: {
          type: "boolean",
          description: "Whether to return related terms alongside the match (default true)",
        },
      },
      required: ["query"],
    },
  },
];

// ---------------------------------------------------------------------------
// Geocoding helper (Mapbox)
// ---------------------------------------------------------------------------

async function geocodeAddress(address: string): Promise<{ lng: number; lat: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=au&limit=1&access_token=${token}`,
      { signal: AbortSignal.timeout(4000) }
    );
    const json = await res.json();
    const feature = json.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.center as [number, number];
    return { lng, lat };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GIS constraint fetch (same logic as /api/maps/parcels but callable directly)
// ---------------------------------------------------------------------------

async function fetchSiteConstraints(lng: number, lat: number) {
  const delta = 0.005;
  const mapExtent = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const imageDisplay = "800,600,96";
  const geometry = JSON.stringify({ x: lng, y: lat });

  function makeParams(returnGeometry: boolean) {
    return new URLSearchParams({
      geometry,
      geometryType: "esriGeometryPoint",
      sr: "4326",
      layers: "all",
      tolerance: "2",
      mapExtent,
      imageDisplay,
      returnGeometry: String(returnGeometry),
      f: "json",
    });
  }

  const urls = {
    cadastre: "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/Cadastre/MapServer/identify",
    planning: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/identify",
    heritage: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Heritage/MapServer/identify",
    bushfire: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Bush_Fire_Prone_Land/MapServer/identify",
    flood: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EP_Flooding/MapServer/identify",
    acidSulfate: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Acid_Sulfate_Soils/MapServer/identify",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  type ArcGISResult = { layerName: string; attributes: Record<string, unknown> };

  async function fetchLayer(url: string, returnGeo: boolean): Promise<ArcGISResult[]> {
    try {
      const res = await fetch(`${url}?${makeParams(returnGeo)}`, { signal: controller.signal });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.results ?? [];
    } catch {
      return [];
    }
  }

  const [cadastreResults, planningResults, heritageResults, bushfireResults, floodResults, acidSulfateResults] =
    await Promise.all([
      fetchLayer(urls.cadastre, false),
      fetchLayer(urls.planning, false),
      fetchLayer(urls.heritage, false),
      fetchLayer(urls.bushfire, false),
      fetchLayer(urls.flood, false),
      fetchLayer(urls.acidSulfate, false),
    ]);

  clearTimeout(timeout);

  // Parse results
  const cadastreAttrs = cadastreResults[0]?.attributes ?? null;
  const lotPlan = (cadastreAttrs?.lotidstring as string) ?? null;
  const rawArea = cadastreAttrs?.shape_Area;
  const lotArea = rawArea ? `${Math.round(parseFloat(String(rawArea)))} m²` : null;

  let zone: string | null = null;
  let lga: string | null = null;
  let epi: string | null = null;
  let heightLimit: string | null = null;
  let fsr: string | null = null;

  if (planningResults.length > 0) {
    const zoneResult = planningResults.find((r) => r.layerName === "Land Zoning");
    if (zoneResult) {
      const code = zoneResult.attributes.SYM_CODE as string | undefined;
      const name = zoneResult.attributes.LAY_CLASS as string | undefined;
      zone = code && name ? `${code} – ${name}` : (code ?? name ?? null);
    }
    const heightResult = planningResults.find((r) => r.layerName === "Height of Buildings");
    if (heightResult) heightLimit = (heightResult.attributes.LAY_CLASS as string) ?? null;
    const fsrResult = planningResults.find((r) => r.layerName === "Floor Space Ratio");
    if (fsrResult) fsr = (fsrResult.attributes.LAY_CLASS as string) ?? null;
    lga = (planningResults.find((r) => r.attributes.LGA_NAME)?.attributes.LGA_NAME as string) ?? null;
    epi = (planningResults.find((r) => r.attributes.EPI_NAME)?.attributes.EPI_NAME as string) ?? null;
  }

  const heritage = heritageResults.length > 0
    ? (heritageResults[0].attributes.LAY_CLASS as string) ?? (heritageResults[0].attributes.ITEM_NAME as string) ?? heritageResults[0].layerName
    : null;
  const bushfire = bushfireResults.length > 0
    ? (bushfireResults[0].attributes.LAY_CLASS as string) ?? (bushfireResults[0].attributes.CATEGORY as string) ?? bushfireResults[0].layerName
    : null;
  const floodRisk = floodResults.length > 0
    ? (floodResults[0].attributes.LAY_CLASS as string) ?? floodResults[0].layerName
    : null;
  const acidSulfate = acidSulfateResults.length > 0
    ? (acidSulfateResults[0].attributes.LAY_CLASS as string) ?? acidSulfateResults[0].layerName
    : null;

  return {
    lotPlan,
    lotArea,
    lga: lga ? lga.replace(/\b\w/g, (c) => c.toUpperCase()) : null,
    zone,
    epi,
    heightLimit,
    fsr,
    heritage,
    bushfire,
    floodRisk,
    acidSulfate,
  };
}

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  try {
    switch (toolName) {
      case "site_lookup":
        return await executeSiteLookup(toolInput);
      case "compliance_check":
        return await executeComplianceCheck(toolInput);
      case "search_projects":
        return await executeSearchProjects(toolInput);
      case "get_project_details":
        return await executeGetProjectDetails(toolInput);
      case "search_das":
        return await executeSearchDAs(toolInput);
      case "biodiversity_search":
        return await executeBiodiversitySearch(toolInput);
      case "analytics_query":
        return await executeAnalyticsQuery(toolInput);
      case "planning_glossary":
        return executeGlossaryLookup(toolInput);
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tool execution failed";
    return JSON.stringify({ error: message });
  }
}

// --- Individual tool executors ---

async function executeSiteLookup(input: Record<string, unknown>): Promise<string> {
  let lng = input.lng as number | undefined;
  let lat = input.lat as number | undefined;
  const address = input.address as string | undefined;

  if (address && (!lng || !lat)) {
    const coords = await geocodeAddress(address);
    if (!coords) return JSON.stringify({ error: "Could not geocode address", address });
    lng = coords.lng;
    lat = coords.lat;
  }

  if (!lng || !lat) return JSON.stringify({ error: "Provide an address or lng/lat coordinates" });

  const data = await fetchSiteConstraints(lng, lat);
  return JSON.stringify({
    ...data,
    coordinates: { lng, lat },
    source: "NSW Government GIS (SIX Maps, DPE Planning Layers)",
  });
}

async function executeComplianceCheck(input: Record<string, unknown>): Promise<string> {
  const projectId = input.project_id as string;
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      complianceItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!project) return JSON.stringify({ error: "Project not found" });

  // Get site constraints if we have an address
  let siteData = null;
  if (project.address) {
    const coords = await geocodeAddress(project.address);
    if (coords) {
      siteData = await fetchSiteConstraints(coords.lng, coords.lat);
    }
  }

  // Evaluate each compliance item against live GIS data
  const results = project.complianceItems.map((item) => {
    const evaluation = siteData
      ? evaluateComplianceFlag(item.label, {
          zone: siteData.zone,
          heightLimit: siteData.heightLimit,
          fsr: siteData.fsr,
          heritage: siteData.heritage,
          floodRisk: siteData.floodRisk,
          bushfire: siteData.bushfire,
          acidSulfate: siteData.acidSulfate,
          lga: siteData.lga,
        })
      : { flagged: false };

    return {
      label: item.label,
      checked: item.checked,
      existing_notes: item.notes,
      gis_flagged: evaluation.flagged,
      gis_notes: evaluation.notes ?? null,
    };
  });

  const flaggedCount = results.filter((r) => r.gis_flagged).length;

  return JSON.stringify({
    project: project.title,
    address: project.address,
    total_items: results.length,
    flagged_count: flaggedCount,
    site_constraints: siteData,
    items: results,
    source: "AXIOM compliance engine + NSW GIS",
  });
}

async function executeSearchProjects(input: Record<string, unknown>): Promise<string> {
  const where: Record<string, unknown> = {};

  if (input.status) where.status = input.status;
  if (input.phase) where.phase = input.phase;
  if (input.lga) where.lga = { contains: input.lga as string, mode: "insensitive" };
  if (input.project_type) where.projectType = { contains: input.project_type as string, mode: "insensitive" };
  if (input.query) {
    where.OR = [
      { title: { contains: input.query as string, mode: "insensitive" } },
      { description: { contains: input.query as string, mode: "insensitive" } },
    ];
  }

  const projects = await db.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      city: true,
      lga: true,
      status: true,
      phase: true,
      projectType: true,
      address: true,
      updatedAt: true,
      _count: { select: { documents: true, complianceItems: true, milestones: true } },
    },
  });

  return JSON.stringify({
    count: projects.length,
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      lga: p.lga,
      status: p.status,
      phase: p.phase,
      type: p.projectType,
      address: p.address,
      updated: p.updatedAt,
      documents: p._count.documents,
      compliance_items: p._count.complianceItems,
      milestones: p._count.milestones,
    })),
  });
}

async function executeGetProjectDetails(input: Record<string, unknown>): Promise<string> {
  const projectId = input.project_id as string;
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: { select: { name: true, email: true, role: true } } } },
      complianceItems: { orderBy: { sortOrder: "asc" } },
      milestones: { orderBy: { sortOrder: "asc" } },
      stakeholders: { orderBy: { createdAt: "asc" } },
      submissions: { orderBy: { dateReceived: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" }, take: 20, include: { uploadedBy: { select: { name: true } } } },
    },
  });

  if (!project) return JSON.stringify({ error: "Project not found" });

  return JSON.stringify({
    id: project.id,
    title: project.title,
    description: project.description,
    city: project.city,
    district: project.district,
    address: project.address,
    status: project.status,
    phase: project.phase,
    lga: project.lga,
    project_type: project.projectType,
    applicant: project.applicantName,
    metrics: {
      dwellings: project.dwellings,
      commercial_gfa: project.commercialGfa,
      building_height: project.buildingHeight,
      storeys: project.storeys,
      car_parking: project.carParking,
      site_area_ha: project.siteAreaHa,
      construction_cost_m: project.constructionCostM,
      green_space_ha: project.greenSpaceHa,
    },
    milestones: project.milestones.map((m) => ({
      name: m.name,
      status: m.milestoneStatus,
      due_date: m.dueDate,
    })),
    compliance: project.complianceItems.map((c) => ({
      label: c.label,
      checked: c.checked,
      notes: c.notes,
    })),
    stakeholders: project.stakeholders.map((s) => ({
      name: s.name,
      role: s.role,
      organisation: s.organisation,
    })),
    submissions: project.submissions.map((s) => ({
      submitter: s.submitterName,
      status: s.status,
      date_received: s.dateReceived,
      key_issues: s.keyIssues,
      supporting: s.supporting,
    })),
    documents: project.documents.map((d) => ({
      name: d.name,
      file_type: d.fileType,
      category: d.category,
      uploaded_by: d.uploadedBy?.name,
      created: d.createdAt,
    })),
    team: project.members.map((m) => ({
      name: m.user.name,
      role: m.role,
    })),
  });
}

async function executeSearchDAs(input: Record<string, unknown>): Promise<string> {
  const result = await searchDAs({
    council: input.council as string | undefined,
    suburb: input.suburb as string | undefined,
    fromDate: input.from_date as string | undefined,
    toDate: input.to_date as string | undefined,
    page: 1,
    pageSize: 15,
  });

  return JSON.stringify({
    total_count: result.totalCount,
    returned: result.applications.length,
    applications: result.applications,
    source: "NSW Planning Portal DAApplicationTracker API",
  });
}

async function executeBiodiversitySearch(input: Record<string, unknown>): Promise<string> {
  let lat = input.lat as number | undefined;
  let lng = input.lng as number | undefined;
  const address = input.address as string | undefined;
  const radiusKm = (input.radius_km as number) ?? 5;

  if (address && (!lat || !lng)) {
    const coords = await geocodeAddress(address);
    if (!coords) return JSON.stringify({ error: "Could not geocode address", address });
    lat = coords.lat;
    lng = coords.lng;
  }

  if (!lat || !lng) return JSON.stringify({ error: "Provide an address or lat/lng coordinates" });

  const species = await fetchThreatenedSpecies(lat, lng, radiusKm);

  return JSON.stringify({
    count: species.length,
    radius_km: radiusKm,
    coordinates: { lat, lng },
    species,
    source: "BioNet Atlas OData API",
  });
}

async function executeAnalyticsQuery(input: Record<string, unknown>): Promise<string> {
  const dataset = input.dataset as string;

  switch (dataset) {
    case "permits": {
      const raw = await fetchBuildingApprovals();
      if (raw.length > 0) {
        return JSON.stringify({
          dataset: "permits",
          data: raw.map((r) => ({ date: r.date, approvals: r.value })),
          source: "ABS Building Approvals (ABS_BA), NSW",
        });
      }
      return JSON.stringify({ dataset: "permits", data: [], source: "ABS API unavailable" });
    }
    case "population": {
      const raw = await fetchPopulation();
      if (raw.length > 0) {
        return JSON.stringify({
          dataset: "population",
          data: raw.map((r) => ({ date: r.date, population: r.value })),
          source: "ABS Estimated Resident Population (ERP), NSW",
        });
      }
      return JSON.stringify({ dataset: "population", data: [], source: "ABS API unavailable" });
    }
    case "zoning":
      return JSON.stringify({
        dataset: "zoning",
        data: [
          { zone: "R2 – Low Density Residential", area_ha: 42000, pct: 26 },
          { zone: "R3 – Medium Density Residential", area_ha: 12000, pct: 7 },
          { zone: "R4 – High Density Residential", area_ha: 4500, pct: 3 },
          { zone: "B4 – Mixed Use", area_ha: 5100, pct: 3 },
          { zone: "IN1 – General Industrial", area_ha: 11000, pct: 7 },
          { zone: "RE1 – Public Recreation", area_ha: 18000, pct: 11 },
          { zone: "RU1–RU6 – Rural", area_ha: 32000, pct: 20 },
          { zone: "E2–E4 – Environmental", area_ha: 14500, pct: 9 },
        ],
        source: "NSW DPE LEP zone distribution (curated)",
      });
    case "infrastructure":
      return JSON.stringify({
        dataset: "infrastructure",
        data: [
          { project: "Sydney Metro West", budget_b: 25, spent_b: 8.2, status: "ACTIVE" },
          { project: "WestConnex M4-M5 Link", budget_b: 16.8, spent_b: 16.8, status: "COMPLETED" },
          { project: "Western Sydney Airport", budget_b: 11, spent_b: 7.5, status: "ACTIVE" },
          { project: "Parramatta Light Rail Stage 2", budget_b: 3.5, spent_b: 0.8, status: "ACTIVE" },
        ],
        source: "NSW Budget Papers 2024-25 / Infrastructure NSW",
      });
    default:
      return JSON.stringify({ error: `Unknown dataset: ${dataset}` });
  }
}
