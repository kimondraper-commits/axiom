"use client";

import dynamic from "next/dynamic";
import type { MapLayer } from "@prisma/client";

const MapContainer = dynamic(
  () => import("@/components/maps/map-container"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 animate-pulse flex items-center justify-center" style={{ background: "var(--carbon)" }}>
        <span style={{ color: "var(--text-ghost)", fontSize: 13 }}>Loading map…</span>
      </div>
    ),
  }
);

export function MapLoader({ layers }: { layers: MapLayer[] }) {
  return <MapContainer layers={layers} />;
}
