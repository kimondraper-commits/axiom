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

  // Seed map layers — NSW Open Data
  await db.mapLayer.upsert({
    where: { id: "nsw-lot-boundaries" },
    update: {},
    create: {
      id: "nsw-lot-boundaries",
      name: "NSW Lot Boundaries",
      description: "[Cadastre] NSW lot and property boundaries",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/LotMap/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 1,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-lep-zones" },
    update: {},
    create: {
      id: "nsw-lep-zones",
      name: "NSW LEP Land Use Zones",
      description: "[Planning] NSW Local Environmental Plan zoning",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 2,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-train-stations" },
    update: {},
    create: {
      id: "nsw-train-stations",
      name: "NSW Train Stations",
      description: "[Transport] TfNSW train station locations",
      layerType: "circle",
      sourceConfig: {
        type: "geojson",
        data: "/api/data-sources/tfnsw/stops",
      },
      layerConfig: {
        type: "circle",
        paint: {
          "circle-color": "#f59e0b",
          "circle-radius": 5,
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1,
        },
      },
      sortOrder: 3,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-flood-planning" },
    update: {},
    create: {
      id: "nsw-flood-planning",
      name: "NSW Flood Planning Areas",
      description: "[Environmental] NSW flood planning area overlays",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EP_Flooding/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 4,
    },
  });

  // --- 10 additional NSW government data layers ---

  await db.mapLayer.upsert({
    where: { id: "nsw-bushfire" },
    update: {},
    create: {
      id: "nsw-bushfire",
      name: "NSW Bushfire Prone Land",
      description: "[Environmental] Bush Fire Prone Land mapping",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Bush_Fire_Prone_Land/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 5,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-heritage" },
    update: {},
    create: {
      id: "nsw-heritage",
      name: "NSW Heritage Items",
      description: "[Planning] EPI Heritage items and conservation areas",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Heritage/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 6,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-acid-sulfate" },
    update: {},
    create: {
      id: "nsw-acid-sulfate",
      name: "NSW Acid Sulfate Soils",
      description: "[Environmental] EPI Acid Sulfate Soils classification",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Acid_Sulfate_Soils/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 7,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-coastal" },
    update: {},
    create: {
      id: "nsw-coastal",
      name: "NSW Coastal Management",
      description: "[Environmental] Coastal Management Areas (SEPP)",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Coastal_Management/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 8,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-wetlands" },
    update: {},
    create: {
      id: "nsw-wetlands",
      name: "NSW Wetlands",
      description: "[Environmental] EPI Wetlands mapping",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Wetlands/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 9,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-riparian" },
    update: {},
    create: {
      id: "nsw-riparian",
      name: "NSW Riparian Lands",
      description: "[Environmental] EPI Riparian Lands and Waterways",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Riparian_Lands/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 10,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-aerial" },
    update: {},
    create: {
      id: "nsw-aerial",
      name: "NSW Aerial Imagery",
      description: "[Cadastre] NSW high-resolution aerial imagery",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/LPI_Imagery_Best/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.8 },
      },
      sortOrder: 11,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-lga-boundaries" },
    update: {},
    create: {
      id: "nsw-lga-boundaries",
      name: "NSW LGA Boundaries",
      description: "[Cadastre] Local Government Area boundaries",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/LGAMap/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.5 },
      },
      sortOrder: 12,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-seed-vegetation" },
    update: {},
    create: {
      id: "nsw-seed-vegetation",
      name: "NSW Native Vegetation",
      description: "[Environmental] SEED Native Vegetation mapping",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/NativeVegetation/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 13,
    },
  });

  await db.mapLayer.upsert({
    where: { id: "nsw-seed-biodiversity" },
    update: {},
    create: {
      id: "nsw-seed-biodiversity",
      name: "NSW Biodiversity Values",
      description: "[Environmental] SEED Biodiversity Values Map",
      layerType: "raster",
      sourceConfig: {
        type: "raster",
        tiles: [
          "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/BiodiversityValuesMap/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      layerConfig: {
        type: "raster",
        paint: { "raster-opacity": 0.6 },
      },
      sortOrder: 14,
    },
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
