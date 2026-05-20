"use client";

import { useState, useCallback, useRef } from "react";
import Map, { Layer, Source, NavigationControl, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { featuresToCSV } from "@/lib/aim/csv-export";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// Zone code groups for the multi-select
const ZONE_GROUPS = [
  {
    label: "Residential",
    codes: ["R1", "R2", "R3", "R4", "R5"],
  },
  {
    label: "Business",
    codes: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
  },
  {
    label: "Mixed Use",
    codes: ["MU1"],
  },
  {
    label: "Industrial",
    codes: ["IN1", "IN2", "IN3", "IN4"],
  },
  {
    label: "Recreation / Environment",
    codes: ["RE1", "RE2", "E1", "E2", "E3", "E4"],
  },
  {
    label: "Special / Rural",
    codes: ["SP1", "SP2", "SP3", "RU1", "RU2", "RU3", "RU4", "RU5", "RU6"],
  },
  {
    label: "Waterway",
    codes: ["W1", "W2", "W3"],
  },
];

interface AimRules {
  zones: string[];
  minHeight?: number;
  minFsr?: number;
  minLotSize?: number;
  maxStationDistKm?: number;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: AimRules;
  resultCount: number;
  createdAt: string;
}

export default function AimFinder() {
  const mapRef = useRef<MapRef | null>(null);

  // Rules
  const [zones, setZones] = useState<Set<string>>(new Set());
  const [minHeight, setMinHeight] = useState("");
  const [minFsr, setMinFsr] = useState("");
  const [maxStationDist, setMaxStationDist] = useState("1");

  // Results
  const [results, setResults] = useState<GeoJSON.FeatureCollection | null>(null);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save
  const [saveName, setSaveName] = useState("");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedLoaded, setSavedLoaded] = useState(false);

  // Toggle zone code
  const toggleZone = useCallback((code: string) => {
    setZones((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  // Toggle entire group
  const toggleGroup = useCallback((codes: string[]) => {
    setZones((prev) => {
      const next = new Set(prev);
      const allSelected = codes.every((c) => next.has(c));
      if (allSelected) codes.forEach((c) => next.delete(c));
      else codes.forEach((c) => next.add(c));
      return next;
    });
  }, []);

  // Run search
  const handleSearch = useCallback(async () => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const rules: AimRules = { zones: Array.from(zones) };
    if (minHeight) rules.minHeight = parseFloat(minHeight);
    if (minFsr) rules.minFsr = parseFloat(minFsr);
    if (maxStationDist) rules.maxStationDistKm = parseFloat(maxStationDist);

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/aim/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bbox, rules }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Search failed");

      setResults(json.data);
      setResultCount(json.meta.total);
    } catch (err) {
      setError((err as Error).message);
      setResults(null);
      setResultCount(0);
    } finally {
      setLoading(false);
    }
  }, [zones, minHeight, minFsr, maxStationDist]);

  // Export CSV
  const handleExport = useCallback(() => {
    if (!results || results.features.length === 0) return;
    const csv = featuresToCSV(results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axiom-aim-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  // Save search
  const handleSave = useCallback(async () => {
    if (!saveName.trim() || !mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const rules: AimRules = { zones: Array.from(zones) };
    if (minHeight) rules.minHeight = parseFloat(minHeight);
    if (minFsr) rules.minFsr = parseFloat(minFsr);
    if (maxStationDist) rules.maxStationDistKm = parseFloat(maxStationDist);

    try {
      await fetch("/api/aim/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bbox, rules, save: { name: saveName.trim() } }),
      });
      setSaveName("");
      loadSavedSearches();
    } catch {
      /* ignore */
    }
  }, [saveName, zones, minHeight, minFsr, maxStationDist]);

  // Load saved searches
  const loadSavedSearches = useCallback(async () => {
    try {
      const res = await fetch("/api/aim/saved");
      const json = await res.json();
      setSavedSearches(json.data ?? []);
      setSavedLoaded(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Load a saved search into the form
  const loadSearch = useCallback((search: SavedSearch) => {
    const f = search.filters;
    setZones(new Set(f.zones ?? []));
    setMinHeight(f.minHeight?.toString() ?? "");
    setMinFsr(f.minFsr?.toString() ?? "");
    setMaxStationDist(f.maxStationDistKm?.toString() ?? "1");
  }, []);

  // Delete saved search
  const deleteSearch = useCallback(async (id: string) => {
    await fetch(`/api/aim/saved?id=${id}`, { method: "DELETE" });
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Load saved on first render
  if (!savedLoaded) loadSavedSearches();

  const labelStyle = {
    fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    color: "var(--text-ghost, #6c7680)",
    marginBottom: 6,
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 5,
    border: "1px solid var(--border, rgba(255,255,255,0.08))",
    background: "var(--void, #04060a)",
    color: "var(--text-primary, #ffffff)",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div className="relative flex flex-1 h-full w-full">
      {/* Rules panel */}
      <div
        className="w-[380px] shrink-0 flex flex-col overflow-y-auto"
        style={{
          background: "var(--carbon, #0d1117)",
          borderRight: "1px solid var(--border, rgba(255,255,255,0.06))",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,0.06))" }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary, #ffffff)",
              marginBottom: 4,
            }}
          >
            AIM Site Finder
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-ghost, #6c7680)" }}>
            Filter NSW planning zones by criteria. Pan the map to set your study area.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Zone multi-select */}
          <div>
            <p style={labelStyle}>Zone Types</p>
            <div className="space-y-2">
              {ZONE_GROUPS.map((group) => (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.codes)}
                    className="w-full text-left px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      color: group.codes.every((c) => zones.has(c))
                        ? "var(--gold, #00e87b)"
                        : "var(--text-secondary, #c8d0d8)",
                      background: group.codes.every((c) => zones.has(c))
                        ? "var(--gold-glow, rgba(0,232,123,0.08))"
                        : "transparent",
                    }}
                  >
                    {group.label}
                  </button>
                  <div className="flex flex-wrap gap-1 mt-1 px-2">
                    {group.codes.map((code) => (
                      <button
                        key={code}
                        onClick={() => toggleZone(code)}
                        className="px-2 py-0.5 text-xs rounded transition-colors"
                        style={{
                          background: zones.has(code)
                            ? "var(--gold, #00e87b)"
                            : "var(--void, #04060a)",
                          color: zones.has(code)
                            ? "var(--void, #04060a)"
                            : "var(--text-ghost, #6c7680)",
                          border: zones.has(code)
                            ? "1px solid var(--gold, #00e87b)"
                            : "1px solid var(--border, rgba(255,255,255,0.08))",
                          fontWeight: zones.has(code) ? 700 : 400,
                          fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <p style={labelStyle}>Min Height (metres)</p>
            <input
              type="number"
              value={minHeight}
              onChange={(e) => setMinHeight(e.target.value)}
              placeholder="e.g. 12"
              style={inputStyle}
            />
          </div>

          {/* FSR */}
          <div>
            <p style={labelStyle}>Min FSR (ratio)</p>
            <input
              type="number"
              step="0.1"
              value={minFsr}
              onChange={(e) => setMinFsr(e.target.value)}
              placeholder="e.g. 1.5"
              style={inputStyle}
            />
          </div>

          {/* Station distance */}
          <div>
            <p style={labelStyle}>Max Station Distance (km)</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.3"
                max="5"
                step="0.1"
                value={maxStationDist}
                onChange={(e) => setMaxStationDist(e.target.value)}
                className="flex-1"
                style={{ accentColor: "var(--gold, #00e87b)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--gold, #00e87b)",
                  minWidth: 48,
                  textAlign: "right",
                }}
              >
                {maxStationDist} km
              </span>
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-3 transition-colors"
            style={{
              borderRadius: 6,
              background: loading ? "var(--text-ghost, #6c7680)" : "var(--gold, #00e87b)",
              color: "var(--void, #04060a)",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "SEARCHING…" : "SEARCH"}
          </button>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: "#ff5e5e" }}>{error}</p>
          )}

          {/* Results summary */}
          {results && (
            <div
              className="p-3"
              style={{
                background: "var(--void, #04060a)",
                border: "1px solid var(--gold, #00e87b)",
                borderRadius: 6,
              }}
            >
              <div className="flex items-center justify-between">
                <span style={labelStyle}>Results</span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--gold, #00e87b)",
                  }}
                >
                  {resultCount}
                </span>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-ghost, #6c7680)",
                  marginTop: 4,
                }}
              >
                zones match your criteria in the current viewport
              </p>
            </div>
          )}

          {/* Export + Save */}
          {results && results.features.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="w-full py-2.5"
                style={{
                  borderRadius: 5,
                  background: "var(--gold, #00e87b)",
                  color: "var(--void, #04060a)",
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  cursor: "pointer",
                }}
              >
                EXPORT CSV
              </button>

              <div className="flex gap-2">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Search name…"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="px-4 py-2 shrink-0"
                  style={{
                    borderRadius: 5,
                    background: saveName.trim()
                      ? "var(--gold-glow, rgba(0,232,123,0.12))"
                      : "var(--void, #04060a)",
                    color: saveName.trim()
                      ? "var(--gold, #00e87b)"
                      : "var(--text-ghost, #6c7680)",
                    border: "1px solid var(--border, rgba(255,255,255,0.08))",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: saveName.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  SAVE
                </button>
              </div>
            </div>
          )}

          {/* Saved searches */}
          {savedSearches.length > 0 && (
            <div>
              <p style={{ ...labelStyle, marginTop: 16 }}>Saved Searches</p>
              <div className="space-y-1">
                {savedSearches.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-3 py-2 rounded"
                    style={{
                      background: "var(--void, #04060a)",
                      border: "1px solid var(--border, rgba(255,255,255,0.06))",
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="truncate"
                        style={{
                          fontSize: 12,
                          color: "var(--text-primary, #ffffff)",
                          fontWeight: 500,
                        }}
                      >
                        {s.name}
                      </p>
                      <p style={{ fontSize: 10, color: "var(--text-ghost, #6c7680)" }}>
                        {s.resultCount} results
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => loadSearch(s)}
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          background: "var(--gold-glow, rgba(0,232,123,0.08))",
                          color: "var(--gold, #00e87b)",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSearch(s.id)}
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          background: "transparent",
                          color: "var(--text-ghost, #6c7680)",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          mapboxAccessToken={TOKEN}
          initialViewState={{
            longitude: 151.17,
            latitude: -33.87,
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        >
          <NavigationControl position="top-right" />

          {/* Results layer */}
          {results && (
            <Source id="aim-results" type="geojson" data={results}>
              <Layer
                id="aim-results-fill"
                type="fill"
                paint={{
                  "fill-color": "#00e87b",
                  "fill-opacity": 0.2,
                }}
              />
              <Layer
                id="aim-results-line"
                type="line"
                paint={{
                  "line-color": "#00e87b",
                  "line-width": 1.5,
                }}
              />
            </Source>
          )}
        </Map>

        {/* Viewport hint */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2"
          style={{
            background: "var(--carbon, #0d1117)",
            border: "1px solid var(--border, rgba(255,255,255,0.06))",
            borderRadius: 6,
            fontSize: 11,
            color: "var(--text-ghost, #6c7680)",
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            letterSpacing: 1,
            pointerEvents: "none",
          }}
        >
          PAN & ZOOM TO SET STUDY AREA • THEN CLICK SEARCH
        </div>
      </div>
    </div>
  );
}
