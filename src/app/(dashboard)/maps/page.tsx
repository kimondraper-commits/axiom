import { db } from "@/lib/db";
import dynamic from "next/dynamic";

export const metadata = { title: "GIS Maps — City Pro" };

const MapContainer = dynamic(
  () => import("@/components/maps/map-container"),
  { ssr: false, loading: () => <div className="flex-1 bg-slate-200 animate-pulse" /> }
);

async function getLayers() {
  return db.mapLayer.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function MapsPage() {
  const layers = await getLayers();

  return (
    <div className="flex h-full">
      <MapContainer layers={layers} />
    </div>
  );
}
