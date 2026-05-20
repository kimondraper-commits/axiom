"use client";

import { useState, useMemo } from "react";
import type { MapLayer } from "@prisma/client";
import { IconSearch } from "./icons";

interface LayersPanelProps {
  layers: MapLayer[];
  activeLayers: Set<string>;
  onToggle: (id: string) => void;
  failedLayers?: Set<string>;
}

const CATEGORY_META: Record<string, { label: string; dot: string }> = {
  Cadastre:      { label: "Cadastre",      dot: "var(--text-ghost, #6c7680)" },
  Planning:      { label: "Planning",      dot: "var(--gold, #00e87b)" },
  Transport:     { label: "Transport",     dot: "#7ad0ff" },
  Environmental: { label: "Environmental", dot: "#7be58a" },
  Housing:       { label: "Housing",       dot: "#ffb145" },
};

function parseCategory(description: string | null): string {
  if (!description) return "Other";
  const m = description.match(/^\[([^\]]+)\]/);
  return m ? m[1] : "Other";
}

function stripCategory(description: string | null): string | null {
  if (!description) return null;
  return description.replace(/^\[[^\]]+\]\s*/, "") || null;
}

export function LayersPanel({ layers, activeLayers, onToggle, failedLayers }: LayersPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return layers;
    return layers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q)
    );
  }, [layers, query]);

  const groups = useMemo(() => {
    const m = new Map<string, MapLayer[]>();
    for (const l of filtered) {
      const cat = parseCategory(l.description);
      if (!m.has(cat)) m.set(cat, []);
      m.get(cat)!.push(l);
    }
    return m;
  }, [filtered]);

  const activeCount = activeLayers.size;
  const totalCount = layers.length;

  return (
    <div className="flex flex-col h-full">
      {/* Search + count */}
      <div className="p-3" style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,0.06))" }}>
        <div
          className="flex items-center gap-2 px-2.5 py-2 rounded"
          style={{
            background: "var(--void, #04060a)",
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
          }}
        >
          <IconSearch size={14} className="text-[var(--text-ghost,#6c7680)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search layers…"
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: "var(--text-primary, #ffffff)" }}
          />
        </div>
        <p
          className="mt-2 px-1"
          style={{
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            fontSize: 9,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "var(--text-ghost, #6c7680)",
          }}
        >
          {activeCount} / {totalCount} active
        </p>
      </div>

      {/* NEW FEATURE callout */}
      <div
        className="mx-3 mt-2 mb-1 px-3 py-2.5 rounded-lg"
        style={{
          background: "rgba(0,232,123,0.06)",
          border: "1px solid rgba(0,232,123,0.15)",
        }}
      >
        <span
          style={{
            fontSize: 8,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--gold, #00e87b)",
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            fontWeight: 700,
          }}
        >
          NEW FEATURE
        </span>
        <p style={{ fontSize: 11, color: "var(--text-secondary, #c8d0d8)", marginTop: 3, lineHeight: 1.4 }}>
          AIM Site Finder — filter zones by height, FSR, and station proximity.{" "}
          <a href="/aim" style={{ color: "var(--gold, #00e87b)", textDecoration: "none", fontWeight: 600 }}>
            Try it →
          </a>
        </p>
      </div>

      {/* Grouped layers */}
      <div className="flex-1 overflow-y-auto px-1 py-2">
        {layers.length === 0 ? (
          <p
            className="px-3 py-4 text-center"
            style={{ fontSize: 12, color: "var(--text-ghost, #6c7680)" }}
          >
            No layers configured.
          </p>
        ) : groups.size === 0 ? (
          <p
            className="px-3 py-4 text-center"
            style={{ fontSize: 12, color: "var(--text-ghost, #6c7680)" }}
          >
            No layers match "{query}"
          </p>
        ) : (
          Array.from(groups.entries()).map(([cat, catLayers]) => {
            const meta = CATEGORY_META[cat] ?? { label: cat, dot: "var(--text-ghost, #6c7680)" };
            return (
              <div key={cat} className="mb-3">
                {/* Category header */}
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 6, height: 6, background: meta.dot }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                      fontSize: 9,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "var(--text-ghost, #6c7680)",
                      fontWeight: 600,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span
                    className="ml-auto"
                    style={{
                      fontSize: 10,
                      color: "var(--text-ghost, #6c7680)",
                      fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                    }}
                  >
                    {catLayers.filter((l) => activeLayers.has(l.id)).length}/{catLayers.length}
                  </span>
                </div>

                {/* Layer pill rows */}
                <div className="space-y-0.5">
                  {catLayers.map((layer) => {
                    const isActive = activeLayers.has(layer.id);
                    return (
                      <button
                        key={layer.id}
                        onClick={() => onToggle(layer.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors group"
                        style={{
                          background: isActive
                            ? "var(--gold-glow, rgba(0,232,123,0.08))"
                            : "transparent",
                          border: "none",
                          borderLeft: isActive
                            ? "2px solid var(--gold, #00e87b)"
                            : "2px solid transparent",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.025)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Status dot */}
                        <span
                          className="inline-block rounded-full shrink-0"
                          style={{
                            width: 8,
                            height: 8,
                            background: isActive
                              ? "var(--gold, #00e87b)"
                              : "var(--border, rgba(255,255,255,0.15))",
                            boxShadow: isActive
                              ? "0 0 6px var(--gold, #00e87b)"
                              : "none",
                            transition: "all 140ms",
                          }}
                        />

                        {/* Label */}
                        <span
                          className="flex-1 truncate flex items-center gap-1.5"
                          style={{
                            fontSize: 12.5,
                            color: isActive
                              ? "var(--text-primary, #ffffff)"
                              : "var(--text-secondary, #c8d0d8)",
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {layer.name}
                          {failedLayers?.has(layer.id) && (
                            <span
                              title="Failed to load tiles"
                              style={{ color: "#ff5e5e", fontSize: 11, flexShrink: 0 }}
                            >
                              ⚠
                            </span>
                          )}
                        </span>

                        {/* Info on hover */}
                        {stripCategory(layer.description) && (
                          <span
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            title={stripCategory(layer.description) || ""}
                            style={{
                              fontSize: 10,
                              color: "var(--text-ghost, #6c7680)",
                              fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                            }}
                          >
                            i
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2.5"
        style={{
          borderTop: "1px solid var(--border, rgba(255,255,255,0.06))",
          fontSize: 10,
          color: "var(--text-ghost, #6c7680)",
        }}
      >
        Click any location on the map to inspect the parcel.
      </div>
    </div>
  );
}
