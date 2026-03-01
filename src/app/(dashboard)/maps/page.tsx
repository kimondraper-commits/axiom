import { db } from "@/lib/db";
import { MapLoader } from "@/components/maps/map-loader";

export const metadata = { title: "GIS Maps — AXIOM" };

async function getLayers() {
  try {
    return await db.mapLayer.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function MapsPage() {
  const layers = await getLayers();

  return (
    <div className="flex h-full">
      <MapLoader layers={layers} />
    </div>
  );
}
