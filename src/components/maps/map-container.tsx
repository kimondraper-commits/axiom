"use client";

import { useState, useCallback } from "react";
import Map, { Layer, Source, NavigationControl, Popup } from "react-map-gl/mapbox";
import { LayerPanel } from "./layer-panel";
import type { MapLayer } from "@prisma/client";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapContainerProps {
  layers: MapLayer[];
}

interface NswParcelData {
  lotPlan: string | null;
  address: string | null;
  lotArea: string | null;
  lga: string | null;
  zone: string | null;
  epi: string | null;
  heightLimit: string | null;
  fsr: string | null;
  heritage: string | null;
  bushfire: string | null;
  floodRisk: string | null;
  acidSulfate: string | null;
  geometry: { type: string; coordinates: number[][][] } | null;
}

interface ParcelPopup {
  lng: number;
  lat: number;
  data: NswParcelData | null;
  loading: boolean;
}

const BASEMAPS = [
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const TOKEN_VALID = TOKEN.startsWith("pk.ey");

export default function MapContainer({ layers }: MapContainerProps) {
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(layers.map((l) => l.id))
  );
  const [basemap, setBasemap] = useState(BASEMAPS[2]);
  const [popup, setPopup] = useState<ParcelPopup | null>(null);

  const toggleLayer = useCallback((id: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleMapClick = useCallback(async (e: { lngLat: { lng: number; lat: number } }) => {
    const { lngLat } = e;
    setPopup({ lng: lngLat.lng, lat: lngLat.lat, data: null, loading: true });
    try {
      const res = await fetch(`/api/maps/parcels?lng=${lngLat.lng}&lat=${lngLat.lat}`);
      const json = await res.json();
      setPopup({ lng: lngLat.lng, lat: lngLat.lat, data: json.data, loading: false });
    } catch {
      setPopup({ lng: lngLat.lng, lat: lngLat.lat, data: null, loading: false });
    }
  }, []);

  if (!TOKEN_VALID) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-3" style={{ background: "var(--carbon)" }}>
        <div style={{ fontSize: 32, color: "var(--text-ghost)" }}>🗺️</div>
        <p style={{ fontWeight: 500, color: "var(--text-secondary)" }}>Mapbox token not configured</p>
        <p style={{ fontSize: 13, color: "var(--text-ghost)" }}>Add <code style={{ background: "var(--slate)", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code style={{ background: "var(--slate)", padding: "2px 6px", borderRadius: 4 }}>.env</code> file</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 h-full">
      <LayerPanel
        layers={layers}
        activeLayers={activeLayers}
        onToggle={toggleLayer}
        basemaps={BASEMAPS}
        currentBasemap={basemap.id}
        onBasemapChange={(id) => setBasemap(BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0])}
      />

      <div className="flex-1 relative">
        <Map
          mapboxAccessToken={TOKEN}
          initialViewState={{ longitude: 151.2093, latitude: -33.8688, zoom: 10 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={basemap.style}
          onClick={handleMapClick}
          cursor="pointer"
        >
          <NavigationControl position="top-right" />

          {layers.map((layer) => {
            if (!activeLayers.has(layer.id)) return null;
            const source = layer.sourceConfig as Record<string, unknown>;
            const layerCfg = layer.layerConfig as Record<string, unknown>;
            return (
              <Source key={`src-${layer.id}`} id={`src-${layer.id}`} {...(source as any)}>
                <Layer key={`lyr-${layer.id}`} id={`lyr-${layer.id}`} {...(layerCfg as any)} />
              </Source>
            );
          })}

          {popup?.data?.geometry && (
            <Source
              id="parcel-highlight"
              type="geojson"
              data={{ type: "Feature", geometry: popup.data.geometry as any, properties: {} }}
            >
              <Layer
                id="parcel-highlight-fill"
                type="fill"
                paint={{ "fill-color": "#c8a44e", "fill-opacity": 0.15 }}
              />
              <Layer
                id="parcel-highlight-line"
                type="line"
                paint={{ "line-color": "#c8a44e", "line-width": 2 }}
              />
            </Source>
          )}

          {popup && (
            <Popup
              longitude={popup.lng}
              latitude={popup.lat}
              anchor="bottom"
              onClose={() => setPopup(null)}
              closeButton
              closeOnClick={false}
            >
              <div className="min-w-[220px] text-sm">
                {popup.loading ? (
                  <p style={{ color: "var(--text-ghost)", padding: "8px 0" }}>Loading…</p>
                ) : popup.data ? (
                  <div className="space-y-3">
                    <div>
                      <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>Parcel</p>
                      <div className="space-y-0.5">
                        {[
                          { label: "Lot/Plan", value: popup.data.lotPlan },
                          { label: "Address", value: popup.data.address },
                          { label: "Area", value: popup.data.lotArea },
                          { label: "LGA", value: popup.data.lga },
                        ].map(({ label, value }) =>
                          value ? (
                            <div key={label} className="flex justify-between gap-4">
                              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                              <span style={{ color: "var(--text-primary)", fontWeight: 500, textAlign: "right" }}>{String(value)}</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                    {(popup.data.zone || popup.data.epi) && (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                        <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>Zoning</p>
                        <div className="space-y-0.5">
                          {[
                            { label: "Zone", value: popup.data.zone },
                            { label: "LEP/EPI", value: popup.data.epi },
                          ].map(({ label, value }) =>
                            value ? (
                              <div key={label} className="flex justify-between gap-4">
                                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                                <span style={{ color: "var(--text-primary)", fontWeight: 500, textAlign: "right" }}>{String(value)}</span>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                    {(popup.data.heightLimit || popup.data.fsr || popup.data.heritage || popup.data.bushfire || popup.data.floodRisk || popup.data.acidSulfate) && (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                        <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>Controls &amp; Constraints</p>
                        <div className="space-y-0.5">
                          {[
                            { label: "Height Limit", value: popup.data.heightLimit },
                            { label: "FSR", value: popup.data.fsr },
                            { label: "Heritage", value: popup.data.heritage },
                            { label: "Bushfire", value: popup.data.bushfire },
                            { label: "Flood Risk", value: popup.data.floodRisk },
                            { label: "Acid Sulfate", value: popup.data.acidSulfate },
                          ].map(({ label, value }) =>
                            value ? (
                              <div key={label} className="flex justify-between gap-4">
                                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                                <span style={{ color: "var(--text-primary)", fontWeight: 500, textAlign: "right" }}>{String(value)}</span>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-ghost)", padding: "8px 0" }}>No data at this location.</p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}
