/**
 * One-off script: update map_layers with correct NSW ArcGIS endpoints.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/fix-layers.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

// ArcGIS dynamic export URL builder for non-cached services
const arcExport = (base: string, layers?: string) =>
  `${base}/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true${layers ? `&layers=show:${layers}` : ""}&f=image`;

const SIX = "https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps";
const EPI1 = "https://mapprod1.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers";
const EPI2 = "https://mapprod1.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Protection_Layers";
const COASTAL = "https://mapprod1.environment.nsw.gov.au/arcgis/rest/services/CoastalManagementSEPP/CoastalManagementSEPP";

type LayerUpdate = {
  id: string;
  name: string;
  description: string;
  layerType: string;
  sourceConfig: any;
  layerConfig: any;
  isActive: boolean;
  sortOrder: number;
};

const rasterLayer = (opacity = 0.6) => ({ type: "raster", paint: { "raster-opacity": opacity } });

const LAYERS: LayerUpdate[] = [
  {
    id: "nsw-lot-boundaries",
    name: "NSW Lot Boundaries",
    description: "[Cadastre] NSW lot and property boundaries",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(`${SIX}/Cadastre`, "0")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "nsw-lep-zones",
    name: "NSW LEP Land Use Zones",
    description: "[Planning] NSW Local Environmental Plan zoning",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI1, "2")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "nsw-train-stations",
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
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "nsw-flood-planning",
    name: "NSW Flood Planning Areas",
    description: "[Environmental] NSW flood planning area overlays",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI2, "1")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "nsw-bushfire",
    name: "NSW Bushfire Prone Land",
    description: "[Environmental] Bush Fire Prone Land mapping (deactivated — no raster export available)",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [""], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: false,
    sortOrder: 5,
  },
  {
    id: "nsw-heritage",
    name: "NSW Heritage Items",
    description: "[Planning] EPI Heritage items and conservation areas",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI1, "0")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "nsw-acid-sulfate",
    name: "NSW Acid Sulfate Soils",
    description: "[Environmental] EPI Acid Sulfate Soils classification",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI2, "0")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 7,
  },
  {
    id: "nsw-coastal",
    name: "NSW Coastal Management",
    description: "[Environmental] Coastal Management Areas (SEPP)",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(COASTAL)], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 8,
  },
  {
    id: "nsw-wetlands",
    name: "NSW Wetlands",
    description: "[Environmental] EPI Wetlands mapping",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI2, "3")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 9,
  },
  {
    id: "nsw-riparian",
    name: "NSW Riparian Lands",
    description: "[Environmental] EPI Riparian Lands and Waterways",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI2, "11")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "nsw-aerial",
    name: "NSW Aerial Imagery",
    description: "[Cadastre] NSW high-resolution aerial imagery",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [`${SIX}/LPI_Imagery_Best/MapServer/tile/{z}/{y}/{x}`], tileSize: 256 },
    layerConfig: rasterLayer(0.8),
    isActive: true,
    sortOrder: 11,
  },
  {
    id: "nsw-lga-boundaries",
    name: "NSW LGA Boundaries",
    description: "[Cadastre] Local Government Area boundaries",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(`${SIX}/Boundaries`, "1")], tileSize: 512 },
    layerConfig: rasterLayer(0.5),
    isActive: true,
    sortOrder: 12,
  },
  {
    id: "nsw-seed-vegetation",
    name: "NSW Native Vegetation",
    description: "[Environmental] SEED Native Vegetation mapping (deactivated — no general veg service)",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [""], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: false,
    sortOrder: 13,
  },
  {
    id: "nsw-seed-biodiversity",
    name: "NSW Biodiversity Values",
    description: "[Environmental] Terrestrial Biodiversity (EPI Protection Layers)",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI2, "4")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 14,
  },
  // New layers
  {
    id: "nsw-height-of-building",
    name: "NSW Height of Building",
    description: "[Planning] Maximum building height limits from LEP",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI1, "5")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 15,
  },
  {
    id: "nsw-fsr",
    name: "NSW Floor Space Ratio",
    description: "[Planning] FSR limits from LEP",
    layerType: "raster",
    sourceConfig: { type: "raster", tiles: [arcExport(EPI1, "1")], tileSize: 512 },
    layerConfig: rasterLayer(0.6),
    isActive: true,
    sortOrder: 16,
  },
];

async function main() {
  console.log("Updating map layers…");
  for (const layer of LAYERS) {
    const { id, ...fields } = layer;
    await db.mapLayer.upsert({
      where: { id },
      update: fields,
      create: layer,
    });
    console.log(`  ${layer.isActive ? "✓" : "✗"} ${layer.name}`);
  }
  console.log(`Done — ${LAYERS.filter((l) => l.isActive).length} active, ${LAYERS.filter((l) => !l.isActive).length} inactive.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
