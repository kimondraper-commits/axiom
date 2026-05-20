import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import crypto from "crypto";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Seeding database…");

  // Seed users
  const admin = await db.user.upsert({
    where: { email: "admin@citypro.gov" },
    update: {},
    create: {
      email: "admin@citypro.gov",
      name: "Admin User",
      role: "ADMIN",
      department: "Planning Department",
      passwordHash: hashPassword("password123"),
    },
  });

  const planner = await db.user.upsert({
    where: { email: "planner@citypro.gov" },
    update: {},
    create: {
      email: "planner@citypro.gov",
      name: "Jane Planner",
      role: "PLANNER",
      department: "Urban Design Division",
      passwordHash: hashPassword("password123"),
    },
  });

  const viewer = await db.user.upsert({
    where: { email: "viewer@citypro.gov" },
    update: {},
    create: {
      email: "viewer@citypro.gov",
      name: "Bob Viewer",
      role: "VIEWER",
      department: "City Council",
      passwordHash: hashPassword("password123"),
    },
  });

  // ── Seed map layers — NSW Open Data ─────────────────────────
  // Helper: ArcGIS dynamic export URL for non-cached services
  const arcExport = (base: string, layers?: string) =>
    `${base}/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true${layers ? `&layers=show:${layers}` : ""}&f=image`;

  const SIX = "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps";
  const EPI1 = "https://mapprod1.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers";
  const EPI2 = "https://mapprod1.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Protection_Layers";
  const COASTAL = "https://mapprod1.environment.nsw.gov.au/arcgis/rest/services/CoastalManagementSEPP/CoastalManagementSEPP";

  // Helper: upsert that ALSO updates on re-seed (not a no-op)
  type LayerSeed = { name: string; description: string; layerType: string; sourceConfig: any; layerConfig: any; isActive?: boolean; sortOrder: number };
  const seedLayer = async (id: string, data: LayerSeed) => {
    const { name, description, layerType, sourceConfig, layerConfig, isActive, sortOrder } = data;
    const fields = { name, description, layerType, sourceConfig, layerConfig, isActive: isActive ?? true, sortOrder };
    await db.mapLayer.upsert({
      where: { id },
      update: fields,
      create: { id, ...fields },
    });
  };

  const rasterExportSource = (url: string) => ({ type: "raster", tiles: [url], tileSize: 512 });
  const rasterTileSource = (url: string, size = 256) => ({ type: "raster", tiles: [url], tileSize: size });
  const rasterLayer = (opacity = 0.6) => ({ type: "raster", paint: { "raster-opacity": opacity } });

  // 1. NSW Lot Boundaries — sixmaps/Cadastre (dynamic, layer 0 = Lot)
  await seedLayer("nsw-lot-boundaries", {
    name: "NSW Lot Boundaries",
    description: "[Cadastre] NSW lot and property boundaries",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(`${SIX}/Cadastre`, "0")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 1,
  });

  // 2. NSW LEP Land Use Zones — EPI Primary Planning Layers (dynamic, layer 2)
  await seedLayer("nsw-lep-zones", {
    name: "NSW LEP Land Use Zones",
    description: "[Planning] NSW Local Environmental Plan zoning",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI1, "2")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 2,
  });

  // 3. NSW Train Stations — internal API (public, no auth)
  await seedLayer("nsw-train-stations", {
    name: "NSW Train Stations",
    description: "[Transport] TfNSW train station locations",
    layerType: "circle",
    sourceConfig: { type: "geojson", data: "/api/data-sources/tfnsw/stops" },
    layerConfig: {
      type: "circle",
      paint: {
        "circle-color": "#00e87b",
        "circle-radius": 5,
        "circle-stroke-color": "#04060a",
        "circle-stroke-width": 1.5,
      },
    },
    sortOrder: 3,
  });

  // 4. NSW Flood Planning — EPI Protection Layers (dynamic, layer 1)
  await seedLayer("nsw-flood-planning", {
    name: "NSW Flood Planning Areas",
    description: "[Environmental] NSW flood planning area overlays",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI2, "1")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 4,
  });

  // 5. NSW Bushfire — DEACTIVATED (no working raster export; parcel inspector shows bushfire status)
  await seedLayer("nsw-bushfire", {
    name: "NSW Bushfire Prone Land",
    description: "[Environmental] Bush Fire Prone Land mapping",
    layerType: "raster",
    sourceConfig: rasterExportSource(""),
    layerConfig: rasterLayer(0.6),
    isActive: false,
    sortOrder: 5,
  });

  // 6. NSW Heritage — EPI Primary Planning Layers (dynamic, layer 0)
  await seedLayer("nsw-heritage", {
    name: "NSW Heritage Items",
    description: "[Planning] EPI Heritage items and conservation areas",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI1, "0")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 6,
  });

  // 7. NSW Acid Sulfate Soils — EPI Protection Layers (dynamic, layer 0)
  await seedLayer("nsw-acid-sulfate", {
    name: "NSW Acid Sulfate Soils",
    description: "[Environmental] EPI Acid Sulfate Soils classification",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI2, "0")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 7,
  });

  // 8. NSW Coastal Management — CoastalManagementSEPP (dynamic, all sublayers)
  await seedLayer("nsw-coastal", {
    name: "NSW Coastal Management",
    description: "[Environmental] Coastal Management Areas (SEPP)",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(COASTAL)),
    layerConfig: rasterLayer(0.6),
    sortOrder: 8,
  });

  // 9. NSW Wetlands — EPI Protection Layers (dynamic, layer 3)
  await seedLayer("nsw-wetlands", {
    name: "NSW Wetlands",
    description: "[Environmental] EPI Wetlands mapping",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI2, "3")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 9,
  });

  // 10. NSW Riparian Lands — EPI Protection Layers (dynamic, layer 11)
  await seedLayer("nsw-riparian", {
    name: "NSW Riparian Lands",
    description: "[Environmental] EPI Riparian Lands and Waterways",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI2, "11")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 10,
  });

  // 11. NSW Aerial Imagery — sixmaps/LPI_Imagery_Best (tile-cached, CONFIRMED WORKING)
  await seedLayer("nsw-aerial", {
    name: "NSW Aerial Imagery",
    description: "[Cadastre] NSW high-resolution aerial imagery",
    layerType: "raster",
    sourceConfig: rasterTileSource(`${SIX}/LPI_Imagery_Best/MapServer/tile/{z}/{y}/{x}`),
    layerConfig: rasterLayer(0.8),
    sortOrder: 11,
  });

  // 12. NSW LGA Boundaries — sixmaps/Boundaries (dynamic, layer 1 = LGA)
  await seedLayer("nsw-lga-boundaries", {
    name: "NSW LGA Boundaries",
    description: "[Cadastre] Local Government Area boundaries",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(`${SIX}/Boundaries`, "1")),
    layerConfig: rasterLayer(0.5),
    sortOrder: 12,
  });

  // 13. NSW Native Vegetation — DEACTIVATED (no general veg raster service available)
  await seedLayer("nsw-seed-vegetation", {
    name: "NSW Native Vegetation",
    description: "[Environmental] SEED Native Vegetation mapping",
    layerType: "raster",
    sourceConfig: rasterExportSource(""),
    layerConfig: rasterLayer(0.6),
    isActive: false,
    sortOrder: 13,
  });

  // 14. NSW Biodiversity — EPI Protection Layers (dynamic, layer 4 = Terrestrial Biodiversity)
  await seedLayer("nsw-seed-biodiversity", {
    name: "NSW Biodiversity Values",
    description: "[Environmental] Terrestrial Biodiversity (EPI Protection Layers)",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI2, "4")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 14,
  });

  // 15. NEW — NSW Height of Building — EPI Primary Planning Layers (layer 5)
  await seedLayer("nsw-height-of-building", {
    name: "NSW Height of Building",
    description: "[Planning] Maximum building height limits from LEP",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI1, "5")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 15,
  });

  // 16. NEW — NSW Floor Space Ratio — EPI Primary Planning Layers (layer 1)
  await seedLayer("nsw-fsr", {
    name: "NSW Floor Space Ratio",
    description: "[Planning] FSR limits from LEP",
    layerType: "raster",
    sourceConfig: rasterExportSource(arcExport(EPI1, "1")),
    layerConfig: rasterLayer(0.6),
    sortOrder: 16,
  });

  // Seed projects
  const project1 = await db.project.upsert({
    where: { id: "proj-downtown-mixed" },
    update: {},
    create: {
      id: "proj-downtown-mixed",
      title: "Downtown Mixed-Use Corridor Rezoning",
      description:
        "Comprehensive rezoning of the Main Street corridor to allow mixed-use development, increase density, and improve walkability. Includes community engagement process and environmental review.",
      status: "ACTIVE",
      phase: "REVIEW",
      city: "Springfield",
      district: "Downtown",
      address: "Main St & 1st Ave",
      budget: 250000,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2025-06-30"),
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: planner.id, role: "PLANNER" },
          { userId: viewer.id, role: "VIEWER" },
        ],
      },
    },
  });

  const project2 = await db.project.upsert({
    where: { id: "proj-riverside-park" },
    update: {},
    create: {
      id: "proj-riverside-park",
      title: "Riverside Park Master Plan",
      description:
        "Development of a new 15-acre riverfront park including trails, picnic areas, event lawn, and accessibility improvements. Part of the city's green infrastructure initiative.",
      status: "PLANNING",
      phase: "DESIGN",
      city: "Springfield",
      district: "Eastside",
      budget: 3200000,
      startDate: new Date("2024-06-01"),
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: planner.id, role: "PLANNER" },
        ],
      },
    },
  });

  // Seed comments
  const comment1 = await db.comment.create({
    data: {
      projectId: project1.id,
      body: "The environmental review for this corridor is well underway. We need to schedule the public hearing before end of Q1.",
      authorId: planner.id,
      isApproved: true,
    },
  });

  await db.comment.create({
    data: {
      projectId: project1.id,
      parentId: comment1.id,
      body: "Agreed. I'll coordinate with the city clerk to get it on the calendar. Can we aim for February 20th?",
      authorId: admin.id,
      isApproved: true,
    },
  });

  await db.comment.create({
    data: {
      projectId: project1.id,
      body: "As a local business owner, I support this rezoning. The corridor needs more foot traffic and mixed uses.",
      authorName: "Maria Santos",
      authorEmail: "maria@mainstreetbiz.com",
      isPublic: true,
      isApproved: false,
    },
  });

  console.log("✅ Seed complete.");
  console.log("");
  console.log("Login credentials:");
  console.log("  Admin:   admin@citypro.gov   / password123");
  console.log("  Planner: planner@citypro.gov / password123");
  console.log("  Viewer:  viewer@citypro.gov  / password123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
