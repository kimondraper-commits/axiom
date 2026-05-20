"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Map, { Layer, Source, Popup, Marker, MapRef } from "react-map-gl/mapbox";
import type { MapLayer } from "@prisma/client";
import * as turf from "@turf/turf";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";

import { MapToolRail, type ToolId } from "./map-tool-rail";
import { SlideOverPanel } from "./slide-over-panel";
import { LayersPanel } from "./panel-layers";
import { BasemapPanel, type Basemap } from "./panel-basemap";
import { IsochronePanel, type IsochroneParams } from "./panel-isochrone";
import { MeasurePanel, type MeasureMode } from "./panel-measure";
import { DrawPanel, type DrawMode } from "./panel-draw";
import { DrawControl } from "./draw-control";

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

const BASEMAPS: Basemap[] = [
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "outdoors", label: "Outdoors", style: "mapbox://styles/mapbox/outdoors-v12" },
];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const TOKEN_VALID = TOKEN.startsWith("pk.ey");

export default function MapContainer({ layers }: MapContainerProps) {
  const mapRef = useRef<MapRef | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // Layer + basemap state
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(layers.map((l) => l.id))
  );
  const [basemap, setBasemap] = useState(BASEMAPS[0]);

  // Parcel popup
  const [popup, setPopup] = useState<ParcelPopup | null>(null);

  // Tool / panel state
  const [activeTool, setActiveTool] = useState<ToolId | null>("layers");
  const [is3D, setIs3D] = useState(false);

  // Layer error tracking
  const [failedLayers, setFailedLayers] = useState<Set<string>>(new Set());

  // Drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [drawnFeatures, setDrawnFeatures] = useState<GeoJSON.Feature[]>([]);

  // Measurement state
  const [measureMode, setMeasureMode] = useState<MeasureMode>(null);
  const [measureCoords, setMeasureCoords] = useState<[number, number][]>([]);
  const [measureResult, setMeasureResult] = useState<{ distance?: number; area?: number } | null>(
    null
  );

  // Isochrone state
  const [isoOrigin, setIsoOrigin] = useState<[number, number] | null>(null);
  const [isoFeatures, setIsoFeatures] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isoLoading, setIsoLoading] = useState(false);

  // ----- Layer toggle -----
  const toggleLayer = useCallback((id: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ----- Tool selection -----
  const handleToolSelect = useCallback(
    (tool: ToolId) => {
      // 3D toggle is special - doesn't open a panel, just toggles pitch
      if (tool === "3d") {
        const next = !is3D;
        setIs3D(next);
        if (mapRef.current) {
          mapRef.current.easeTo({
            pitch: next ? 60 : 0,
            bearing: next ? -20 : 0,
            duration: 800,
          });
        }
        return;
      }
      // Toggle: clicking same tool closes it
      setActiveTool((prev) => (prev === tool ? null : tool));
      // Reset transient modes when switching tools
      if (tool !== "draw") setDrawMode(null);
      if (tool !== "measure") {
        setMeasureMode(null);
      }
    },
    [is3D]
  );

  // ----- Map click handler (parcel inspect / measure / isochrone) -----
  const handleMapClick = useCallback(
    async (e: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = e.lngLat;

      // Measurement mode: collect points
      if (measureMode) {
        setMeasureCoords((prev) => {
          const next: [number, number][] = [...prev, [lng, lat]];
          if (measureMode === "distance" && next.length >= 2) {
            const line = turf.lineString(next);
            const km = turf.length(line, { units: "kilometers" });
            setMeasureResult({ distance: km * 1000 });
          } else if (measureMode === "area" && next.length >= 3) {
            const ring: [number, number][] = [...next, next[0]];
            const poly = turf.polygon([ring]);
            setMeasureResult({ area: turf.area(poly) });
          }
          return next;
        });
        return;
      }

      // Isochrone mode: drop origin marker
      if (activeTool === "isochrone") {
        setIsoOrigin([lng, lat]);
        setIsoFeatures(null);
        return;
      }

      // Drawing mode: let mapbox-gl-draw handle it
      if (drawMode) return;

      // Default: parcel inspect
      setPopup({ lng, lat, data: null, loading: true });
      try {
        const res = await fetch(`/api/maps/parcels?lng=${lng}&lat=${lat}`);
        const json = await res.json();
        setPopup({ lng, lat, data: json.data, loading: false });
      } catch {
        setPopup({ lng, lat, data: null, loading: false });
      }
    },
    [measureMode, activeTool, drawMode]
  );

  // ----- Draw mode change -----
  useEffect(() => {
    if (!drawRef.current) return;
    if (drawMode) {
      try {
        // mapbox-gl-draw's changeMode is overloaded with literal types per mode;
        // cast to any to allow our union type.
        (drawRef.current.changeMode as any)(drawMode);
      } catch (err) {
        console.warn("Draw mode change failed:", err);
      }
    }
  }, [drawMode]);

  const handleDrawCreate = useCallback((e: { features: GeoJSON.Feature[] }) => {
    setDrawnFeatures((prev) => [...prev, ...e.features]);
    setDrawMode(null);
  }, []);

  const handleDrawUpdate = useCallback((e: { features: GeoJSON.Feature[] }) => {
    setDrawnFeatures((prev) => {
      const updatedIds = new Set(e.features.map((f) => f.id));
      return [...prev.filter((f) => !updatedIds.has(f.id)), ...e.features];
    });
  }, []);

  const handleDrawDelete = useCallback((e: { features: GeoJSON.Feature[] }) => {
    setDrawnFeatures((prev) => {
      const deletedIds = new Set(e.features.map((f) => f.id));
      return prev.filter((f) => !deletedIds.has(f.id));
    });
  }, []);

  const clearAllDrawings = useCallback(() => {
    if (drawRef.current) drawRef.current.deleteAll();
    setDrawnFeatures([]);
  }, []);

  const exportDrawingsAsGeoJSON = useCallback(() => {
    if (drawnFeatures.length === 0) return;
    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: drawnFeatures,
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axiom-drawings-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }, [drawnFeatures]);

  // ----- Measurement helpers -----
  const clearMeasurement = useCallback(() => {
    setMeasureCoords([]);
    setMeasureResult(null);
    setMeasureMode(null);
  }, []);

  const measureGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (measureCoords.length < 2) return null;
    if (measureMode === "distance") {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates: measureCoords },
            properties: {},
          },
        ],
      };
    }
    if (measureMode === "area" && measureCoords.length >= 3) {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [[...measureCoords, measureCoords[0]]] },
            properties: {},
          },
        ],
      };
    }
    return null;
  }, [measureCoords, measureMode]);

  // ----- Isochrone generation -----
  const generateIsochrone = useCallback(
    async (params: IsochroneParams) => {
      if (!isoOrigin) {
        alert("Click anywhere on the map first to set the origin point.");
        return;
      }
      setIsoLoading(true);
      try {
        const minutes = params.minutes.join(",");
        const url = `https://api.mapbox.com/isochrone/v1/mapbox/${params.profile}/${isoOrigin[0]},${isoOrigin[1]}?contours_minutes=${minutes}&polygons=true&denoise=1&access_token=${TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.features) {
          // Sort so larger isochrones render first (so smaller stack on top)
          data.features.sort(
            (a: any, b: any) => (b.properties.contour ?? 0) - (a.properties.contour ?? 0)
          );
          setIsoFeatures(data);
        }
      } catch (err) {
        console.error("Isochrone fetch failed:", err);
      } finally {
        setIsoLoading(false);
      }
    },
    [isoOrigin]
  );

  const clearIsochrone = useCallback(() => {
    setIsoOrigin(null);
    setIsoFeatures(null);
  }, []);

  // ----- Screenshot -----
  const handleScreenshot = useCallback(() => {
    if (!mapRef.current) return;
    const canvas = mapRef.current.getCanvas();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `axiom-map-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, []);

  // ----- Fullscreen -----
  const handleFullscreen = useCallback(() => {
    const el = mapRef.current?.getContainer();
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  }, []);

  // ----- Layer error listener -----
  const handleMapError = useCallback((e: any) => {
    const sourceId = e?.sourceId ?? e?.source?.id ?? "";
    if (sourceId && sourceId.startsWith("src-")) {
      const layerId = sourceId.replace("src-", "");
      setFailedLayers((prev) => {
        if (prev.has(layerId)) return prev;
        const next = new Set(prev);
        next.add(layerId);
        return next;
      });
      console.warn(`[AXIOM] Layer tile failed: ${layerId}`, e.error?.message ?? e);
    }
  }, []);

  // ----- Token check -----
  if (!TOKEN_VALID) {
    return (
      <div
        className="flex flex-1 items-center justify-center flex-col gap-3"
        style={{ background: "var(--carbon, #0d1117)" }}
      >
        <div style={{ fontSize: 32, color: "var(--text-ghost, #6c7680)" }}>🗺️</div>
        <p style={{ fontWeight: 500, color: "var(--text-secondary, #c8d0d8)" }}>
          Mapbox token not configured
        </p>
        <p style={{ fontSize: 13, color: "var(--text-ghost, #6c7680)" }}>
          Add{" "}
          <code style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to your{" "}
          <code style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>
            .env
          </code>{" "}
          file
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 h-full w-full">
      {/* Tool rail (always visible) */}
      <MapToolRail
        activeTool={activeTool}
        is3D={is3D}
        onSelect={handleToolSelect}
        onScreenshot={handleScreenshot}
        onFullscreen={handleFullscreen}
      />

      {/* Slide-over panels */}
      <SlideOverPanel
        open={activeTool === "layers"}
        title="Map Layers"
        onClose={() => setActiveTool(null)}
      >
        <LayersPanel layers={layers} activeLayers={activeLayers} onToggle={toggleLayer} failedLayers={failedLayers} />
      </SlideOverPanel>

      <SlideOverPanel
        open={activeTool === "basemap"}
        title="Basemap"
        onClose={() => setActiveTool(null)}
      >
        <BasemapPanel
          basemaps={BASEMAPS}
          current={basemap.id}
          onSelect={(id) => {
            const b = BASEMAPS.find((x) => x.id === id);
            if (b) setBasemap(b);
          }}
        />
      </SlideOverPanel>

      <SlideOverPanel
        open={activeTool === "draw"}
        title="Drawing Tools"
        onClose={() => setActiveTool(null)}
      >
        <DrawPanel
          mode={drawMode}
          featureCount={drawnFeatures.length}
          onSetMode={setDrawMode}
          onClearAll={clearAllDrawings}
          onExport={exportDrawingsAsGeoJSON}
        />
      </SlideOverPanel>

      <SlideOverPanel
        open={activeTool === "measure"}
        title="Measurement"
        onClose={() => setActiveTool(null)}
      >
        <MeasurePanel
          mode={measureMode}
          onSetMode={(m) => {
            setMeasureMode(m);
            setMeasureCoords([]);
            setMeasureResult(null);
          }}
          onClear={clearMeasurement}
          result={measureResult}
        />
      </SlideOverPanel>

      <SlideOverPanel
        open={activeTool === "isochrone"}
        title="Isochrone"
        onClose={() => setActiveTool(null)}
      >
        <IsochronePanel
          onGenerate={generateIsochrone}
          onClear={clearIsochrone}
          hasResult={!!isoFeatures || !!isoOrigin}
        />
      </SlideOverPanel>

      {/* Loading badge */}
      {isoLoading && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2"
          style={{
            background: "var(--carbon, #0d1117)",
            border: "1px solid var(--gold, #00e87b)",
            borderRadius: 6,
            color: "var(--gold, #00e87b)",
            fontSize: 11,
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          Generating isochrone…
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative" style={{ marginLeft: 56 }}>
        <Map
          ref={mapRef}
          mapboxAccessToken={TOKEN}
          initialViewState={{
            longitude: 151.2093,
            latitude: -33.8688,
            zoom: 12,
            pitch: 0,
            bearing: 0,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={basemap.style}
          onError={handleMapError}
          onClick={handleMapClick}
          cursor={
            measureMode || activeTool === "isochrone"
              ? "crosshair"
              : drawMode
              ? "crosshair"
              : "pointer"
          }
        >
          {/* Drawing control */}
          <DrawControl
            drawRef={drawRef}
            onCreate={handleDrawCreate}
            onUpdate={handleDrawUpdate}
            onDelete={handleDrawDelete}
          />

          {/* DB-driven layers */}
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

          {/* 3D Buildings layer (only when 3D mode is on) */}
          {is3D && (
            <Layer
              id="3d-buildings"
              source="composite"
              source-layer="building"
              filter={["==", "extrude", "true"]}
              type="fill-extrusion"
              minzoom={14}
              paint={{
                "fill-extrusion-color": "#1a3530",
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": ["get", "min_height"],
                "fill-extrusion-opacity": 0.85,
              }}
            />
          )}

          {/* Parcel highlight */}
          {popup?.data?.geometry && (
            <Source
              id="parcel-highlight"
              type="geojson"
              data={{
                type: "Feature",
                geometry: popup.data.geometry as any,
                properties: {},
              }}
            >
              <Layer
                id="parcel-highlight-fill"
                type="fill"
                paint={{ "fill-color": "#00e87b", "fill-opacity": 0.18 }}
              />
              <Layer
                id="parcel-highlight-line"
                type="line"
                paint={{ "line-color": "#00e87b", "line-width": 2 }}
              />
            </Source>
          )}

          {/* Measurement preview */}
          {measureGeoJSON && (
            <Source id="measure-src" type="geojson" data={measureGeoJSON as any}>
              <Layer
                id="measure-line"
                type="line"
                filter={["==", "$type", "LineString"]}
                paint={{
                  "line-color": "#00e87b",
                  "line-width": 3,
                  "line-dasharray": [2, 2],
                }}
              />
              <Layer
                id="measure-fill"
                type="fill"
                filter={["==", "$type", "Polygon"]}
                paint={{
                  "fill-color": "#00e87b",
                  "fill-opacity": 0.15,
                }}
              />
              <Layer
                id="measure-outline"
                type="line"
                filter={["==", "$type", "Polygon"]}
                paint={{ "line-color": "#00e87b", "line-width": 2.5 }}
              />
            </Source>
          )}

          {/* Measurement vertices */}
          {measureCoords.length > 0 && (
            <Source
              id="measure-points"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: measureCoords.map((c) => ({
                  type: "Feature",
                  geometry: { type: "Point", coordinates: c },
                  properties: {},
                })),
              }}
            >
              <Layer
                id="measure-points-layer"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#00e87b",
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#04060a",
                }}
              />
            </Source>
          )}

          {/* Isochrone polygons */}
          {isoFeatures && (
            <Source id="iso-src" type="geojson" data={isoFeatures as any}>
              <Layer
                id="iso-fill"
                type="fill"
                paint={{
                  "fill-color": [
                    "match",
                    ["get", "contour"],
                    5, "#00e87b",
                    10, "#7be58a",
                    15, "#a8f5b0",
                    "#00e87b",
                  ],
                  "fill-opacity": 0.22,
                }}
              />
              <Layer
                id="iso-line"
                type="line"
                paint={{
                  "line-color": "#00e87b",
                  "line-width": 2,
                }}
              />
            </Source>
          )}

          {/* Isochrone origin marker */}
          {isoOrigin && (
            <Marker longitude={isoOrigin[0]} latitude={isoOrigin[1]} anchor="center">
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#00e87b",
                  border: "3px solid #04060a",
                  boxShadow: "0 0 0 2px #00e87b, 0 0 12px rgba(0,232,123,0.6)",
                }}
              />
            </Marker>
          )}

          {/* Parcel popup */}
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
                  <p style={{ color: "var(--text-ghost, #6c7680)", padding: "8px 0" }}>Loading…</p>
                ) : popup.data ? (
                  <div className="space-y-3">
                    <ParcelSection
                      title="Parcel"
                      rows={[
                        { label: "Lot/Plan", value: popup.data.lotPlan },
                        { label: "Address", value: popup.data.address },
                        { label: "Area", value: popup.data.lotArea },
                        { label: "LGA", value: popup.data.lga },
                      ]}
                    />
                    {(popup.data.zone || popup.data.epi) && (
                      <ParcelSection
                        title="Zoning"
                        rows={[
                          { label: "Zone", value: popup.data.zone },
                          { label: "LEP/EPI", value: popup.data.epi },
                        ]}
                      />
                    )}
                    {(popup.data.heightLimit ||
                      popup.data.fsr ||
                      popup.data.heritage ||
                      popup.data.bushfire ||
                      popup.data.floodRisk ||
                      popup.data.acidSulfate) && (
                      <ParcelSection
                        title="Controls & Constraints"
                        rows={[
                          { label: "Height Limit", value: popup.data.heightLimit },
                          { label: "FSR", value: popup.data.fsr },
                          { label: "Heritage", value: popup.data.heritage },
                          { label: "Bushfire", value: popup.data.bushfire },
                          { label: "Flood Risk", value: popup.data.floodRisk },
                          { label: "Acid Sulfate", value: popup.data.acidSulfate },
                        ]}
                      />
                    )}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-ghost, #6c7680)", padding: "8px 0" }}>
                    No data at this location.
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}

function ParcelSection({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string | null }[];
}) {
  const visible = rows.filter((r) => r.value);
  if (visible.length === 0) return null;
  return (
    <div style={{ borderTop: title !== "Parcel" ? "1px solid var(--border, rgba(255,255,255,0.06))" : "none", paddingTop: title !== "Parcel" ? 8 : 0 }}>
      <p
        style={{
          fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--gold, #00e87b)",
          marginBottom: 4,
        }}
      >
        {title}
      </p>
      <div className="space-y-0.5">
        {visible.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4">
            <span style={{ color: "var(--text-secondary, #c8d0d8)" }}>{label}</span>
            <span
              style={{
                color: "var(--text-primary, #ffffff)",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
