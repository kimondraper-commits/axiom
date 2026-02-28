"use client";

import { useState } from "react";
import type { MapLayer } from "@prisma/client";

interface Basemap { id: string; label: string; style: string }

interface LayerPanelProps {
  layers: MapLayer[];
  activeLayers: Set<string>;
  onToggle: (id: string) => void;
  basemaps: Basemap[];
  currentBasemap: string;
  onBasemapChange: (id: string) => void;
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  Cadastre:      { label: "Cadastre",      color: "var(--text-ghost)" },
  Planning:      { label: "Planning",      color: "var(--gold)" },
  Transport:     { label: "Transport",     color: "#f59e0b" },
  Environmental: { label: "Environmental", color: "#4ade80" },
};

const UNCATEGORISED = "Other";

function parseCategory(description: string | null): string {
  if (!description) return UNCATEGORISED;
  const match = description.match(/^\[([^\]]+)\]/);
  return match ? match[1] : UNCATEGORISED;
}

function stripCategory(description: string | null): string | null {
  if (!description) return null;
  return description.replace(/^\[[^\]]+\]\s*/, "") || null;
}

const POPUP_KEY = [
  {
    section: "Parcel",
    fields: [
      { label: "Lot/Plan", desc: "Unique lot identifier from NSW Land Registry. e.g. 3//DP201225 = Lot 3 in Deposited Plan 201225." },
      { label: "Area", desc: "Land area in square metres from cadastral survey data." },
      { label: "LGA", desc: "Local Government Area — the council responsible for this land." },
    ],
  },
  {
    section: "Zoning",
    fields: [
      { label: "Zone", desc: "Land use zone code and name from the applicable Local Environmental Plan (LEP). Controls what can be built or used on the land." },
      { label: "LEP/EPI", desc: "The Environmental Planning Instrument (EPI) — the specific LEP document that sets zoning and development rules for this area." },
    ],
  },
  {
    section: "Controls & Constraints",
    fields: [
      { label: "Height Limit", desc: "Maximum building height (metres) from the LEP Height of Buildings map." },
      { label: "FSR", desc: "Floor Space Ratio — maximum ratio of gross floor area to site area from the LEP." },
      { label: "Heritage", desc: "Heritage listing from the LEP Heritage map. Triggers Heritage Impact Statement requirements." },
      { label: "Bushfire", desc: "Bush Fire Prone Land category (1, 2, 3 or buffer). Triggers Planning for Bush Fire Protection (PBP) requirements." },
      { label: "Flood Risk", desc: "Flood planning area classification from the EP Flooding overlay." },
      { label: "Acid Sulfate", desc: "Acid Sulfate Soils class (1–5) from the LEP. Lower class = higher risk." },
    ],
  },
];

export function LayerPanel({
  layers,
  activeLayers,
  onToggle,
  basemaps,
  currentBasemap,
  onBasemapChange,
}: LayerPanelProps) {
  const [keyOpen, setKeyOpen] = useState(false);

  const groups = new Map<string, MapLayer[]>();
  for (const layer of layers) {
    const cat = parseCategory(layer.description);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(layer);
  }

  return (
    <div className="w-64 shrink-0 flex flex-col overflow-y-auto" style={{ background: "var(--carbon)", borderRight: "1px solid var(--border)" }}>
      <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Map Layers</h2>
      </div>

      {/* Basemap switcher */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 8 }}>Basemap</p>
        <div className="space-y-1">
          {basemaps.map((b) => (
            <button
              key={b.id}
              onClick={() => onBasemapChange(b.id)}
              className="w-full text-left px-3 py-1.5 rounded transition-colors"
              style={{
                fontSize: 13,
                background: currentBasemap === b.id ? "var(--gold-glow)" : "transparent",
                color: currentBasemap === b.id ? "var(--gold)" : "var(--text-secondary)",
                fontWeight: currentBasemap === b.id ? 500 : 400,
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data layers grouped by category */}
      <div className="px-4 py-3 space-y-4">
        <p style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)" }}>Data Layers</p>
        {layers.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--text-ghost)", padding: "8px 0" }}>No layers configured.</p>
        ) : (
          Array.from(groups.entries()).map(([cat, catLayers]) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ background: meta ? meta.color : "var(--text-ghost)" }}
                  />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                    {meta ? meta.label : cat}
                  </p>
                </div>
                <div className="space-y-1">
                  {catLayers.map((layer) => (
                    <label
                      key={layer.id}
                      className="flex items-center gap-2.5 px-1 py-1.5 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={activeLayers.has(layer.id)}
                        onChange={() => onToggle(layer.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <span style={{ fontSize: 13, color: "var(--text-primary)" }} className="truncate block">{layer.name}</span>
                        {stripCategory(layer.description) && (
                          <span style={{ fontSize: 11, color: "var(--text-ghost)" }} className="truncate block">
                            {stripCategory(layer.description)}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Popup field key */}
      <div className="mt-auto" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setKeyOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 transition-colors"
          style={{ fontSize: 11, color: "var(--text-ghost)" }}
        >
          <span style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", letterSpacing: 2, textTransform: "uppercase" }}>Popup Field Key</span>
          <span style={{ color: "var(--text-ghost)" }}>{keyOpen ? "▲" : "▼"}</span>
        </button>
        {keyOpen && (
          <div className="px-4 pb-4 space-y-3">
            {POPUP_KEY.map(({ section, fields }) => (
              <div key={section}>
                <p style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 6 }}>{section}</p>
                <div className="space-y-2">
                  {fields.map(({ label, desc }) => (
                    <div key={label}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</p>
                      <p style={{ fontSize: 11, color: "var(--text-ghost)", lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, color: "var(--text-ghost)" }}>Click any location on the map to view parcel data.</p>
        </div>
      </div>
    </div>
  );
}
