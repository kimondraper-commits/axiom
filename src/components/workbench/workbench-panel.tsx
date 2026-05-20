"use client";

import { useState, useCallback, useRef } from "react";
import Map, { Layer, Source, NavigationControl, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { parseKML } from "@/lib/import/parsers-kml";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface Dataset {
  id: string;
  name: string;
  createdAt: string;
}

export default function WorkbenchPanel() {
  const mapRef = useRef<MapRef | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeGeoJson, setActiveGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [activeName, setActiveName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Load datasets list
  const loadDatasets = useCallback(async () => {
    try {
      const res = await fetch("/api/datasets");
      const json = await res.json();
      setDatasets(json.data ?? []);
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, []);

  if (!loaded) loadDatasets();

  // Handle file upload (KML or GeoJSON)
  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      let geoJson: GeoJSON.FeatureCollection;
      const name = file.name.replace(/\.(kml|geojson|json)$/i, "");

      if (file.name.toLowerCase().endsWith(".kml")) {
        const parsed = await parseKML(file);
        geoJson = parsed.geoJson;
      } else {
        const text = await file.text();
        geoJson = JSON.parse(text);
      }

      if (!geoJson.features || geoJson.features.length === 0) {
        setError("No features found in file");
        return;
      }

      // Save to API
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, geoJson }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error ?? "Failed to save");
      }

      // Show on map
      setActiveGeoJson(geoJson);
      setActiveName(name);

      // Refresh list
      loadDatasets();

      // Fly to data bounds
      if (mapRef.current && geoJson.features.length > 0) {
        const bounds = computeBounds(geoJson);
        if (bounds) {
          mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [loadDatasets]);

  // Load dataset onto map
  const loadDataset = useCallback(async (id: string, name: string) => {
    try {
      // For now, refetch from API. In future could cache.
      // The datasets list doesn't include geoJson (too large), so we need a separate endpoint.
      // Hack: use the full dataset endpoint with id
      const res = await fetch(`/api/datasets`);
      const json = await res.json();
      // We'd need a /api/datasets/[id] route for this.
      // For now, just set active name to indicate selection
      setActiveName(name);
    } catch {
      /* ignore */
    }
  }, []);

  // Delete dataset
  const deleteDataset = useCallback(async (id: string) => {
    await fetch(`/api/datasets?id=${id}`, { method: "DELETE" });
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    if (activeName) setActiveGeoJson(null);
  }, [activeName]);

  const labelStyle = {
    fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    color: "var(--text-ghost, #6c7680)",
    marginBottom: 6,
  };

  return (
    <div className="relative flex flex-1 h-full w-full">
      {/* Panel */}
      <div
        className="w-[380px] shrink-0 flex flex-col overflow-y-auto"
        style={{
          background: "var(--carbon, #0d1117)",
          borderRight: "1px solid var(--border, rgba(255,255,255,0.06))",
        }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,0.06))" }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary, #ffffff)", marginBottom: 4 }}>
            Workbench
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-ghost, #6c7680)" }}>
            Upload KML or GeoJSON files to overlay on the map.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Upload zone */}
          <div>
            <p style={labelStyle}>Upload Dataset</p>
            <div
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-lg cursor-pointer transition-colors"
              style={{
                border: "2px dashed var(--border, rgba(255,255,255,0.12))",
                background: "var(--void, #04060a)",
              }}
              onClick={() => fileRef.current?.click()}
            >
              <span style={{ fontSize: 24, color: "var(--text-ghost, #6c7680)" }}>↑</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary, #c8d0d8)" }}>
                {uploading ? "Processing…" : "Click to upload KML or GeoJSON"}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-ghost, #6c7680)" }}>
                .kml .geojson .json
              </span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".kml,.geojson,.json"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {error && <p style={{ fontSize: 12, color: "#ff5e5e" }}>{error}</p>}

          {/* Active dataset info */}
          {activeGeoJson && (
            <div
              className="p-3"
              style={{
                background: "var(--void, #04060a)",
                border: "1px solid var(--gold, #00e87b)",
                borderRadius: 6,
              }}
            >
              <p style={labelStyle}>Active on Map</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #ffffff)" }}>
                {activeName}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-ghost, #6c7680)", marginTop: 2 }}>
                {activeGeoJson.features.length} features
              </p>
            </div>
          )}

          {/* Saved datasets */}
          <div>
            <p style={labelStyle}>My Datasets ({datasets.length})</p>
            {datasets.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-ghost, #6c7680)" }}>
                No datasets saved yet. Upload a file to get started.
              </p>
            ) : (
              <div className="space-y-1">
                {datasets.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between px-3 py-2 rounded"
                    style={{
                      background: "var(--void, #04060a)",
                      border: "1px solid var(--border, rgba(255,255,255,0.06))",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate" style={{ fontSize: 12, color: "var(--text-primary, #ffffff)", fontWeight: 500 }}>
                        {d.name}
                      </p>
                      <p style={{ fontSize: 10, color: "var(--text-ghost, #6c7680)" }}>
                        {new Date(d.createdAt).toLocaleDateString("en-AU")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteDataset(d.id)}
                      className="px-2 py-1 text-xs rounded"
                      style={{ background: "transparent", color: "var(--text-ghost, #6c7680)", border: "none", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          mapboxAccessToken={TOKEN}
          initialViewState={{ longitude: 151.2, latitude: -33.87, zoom: 11 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        >
          <NavigationControl position="top-right" />

          {activeGeoJson && (
            <Source id="workbench-data" type="geojson" data={activeGeoJson}>
              <Layer
                id="workbench-fill"
                type="fill"
                filter={["==", "$type", "Polygon"]}
                paint={{ "fill-color": "#00e87b", "fill-opacity": 0.15 }}
              />
              <Layer
                id="workbench-line"
                type="line"
                filter={["any", ["==", "$type", "LineString"], ["==", "$type", "Polygon"]]}
                paint={{ "line-color": "#00e87b", "line-width": 2 }}
              />
              <Layer
                id="workbench-points"
                type="circle"
                filter={["==", "$type", "Point"]}
                paint={{
                  "circle-color": "#00e87b",
                  "circle-radius": 6,
                  "circle-stroke-color": "#04060a",
                  "circle-stroke-width": 2,
                }}
              />
            </Source>
          )}
        </Map>
      </div>
    </div>
  );
}

function computeBounds(
  fc: GeoJSON.FeatureCollection
): [[number, number], [number, number]] | null {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const f of fc.features) {
    const coords = extractCoords(f.geometry);
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  if (!isFinite(minLng)) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
}

function extractCoords(geom: GeoJSON.Geometry): [number, number][] {
  if (geom.type === "Point") return [geom.coordinates as [number, number]];
  if (geom.type === "MultiPoint" || geom.type === "LineString")
    return geom.coordinates as [number, number][];
  if (geom.type === "Polygon" || geom.type === "MultiLineString")
    return geom.coordinates.flat() as [number, number][];
  if (geom.type === "MultiPolygon")
    return geom.coordinates.flat(2) as [number, number][];
  return [];
}
