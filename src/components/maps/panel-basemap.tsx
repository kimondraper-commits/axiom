"use client";

export interface Basemap {
  id: string;
  label: string;
  style: string;
  preview?: string; // optional thumbnail color/gradient
}

interface BasemapPanelProps {
  basemaps: Basemap[];
  current: string;
  onSelect: (id: string) => void;
}

export function BasemapPanel({ basemaps, current, onSelect }: BasemapPanelProps) {
  return (
    <div className="p-3">
      <p
        className="px-1 mb-2"
        style={{
          fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
          fontSize: 9,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: "var(--text-ghost, #6c7680)",
        }}
      >
        Choose basemap
      </p>
      <div className="grid grid-cols-2 gap-2">
        {basemaps.map((b) => {
          const active = current === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className="flex flex-col items-stretch overflow-hidden transition-all"
              style={{
                borderRadius: 6,
                background: "var(--void, #04060a)",
                border: active
                  ? "1.5px solid var(--gold, #00e87b)"
                  : "1px solid var(--border, rgba(255,255,255,0.08))",
                cursor: "pointer",
                boxShadow: active ? "0 0 0 2px rgba(0,232,123,0.15)" : "none",
              }}
            >
              <div
                style={{
                  height: 56,
                  background: b.preview ?? defaultPreview(b.id),
                }}
              />
              <div
                className="px-2 py-1.5 text-left"
                style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? "var(--gold, #00e87b)"
                    : "var(--text-primary, #ffffff)",
                  borderTop: "1px solid var(--border, rgba(255,255,255,0.06))",
                }}
              >
                {b.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function defaultPreview(id: string): string {
  switch (id) {
    case "streets":
      return "linear-gradient(135deg, #2a3540 0%, #1a2530 100%)";
    case "satellite":
      return "linear-gradient(135deg, #1a3a1a 0%, #0a2810 50%, #1a3030 100%)";
    case "light":
      return "linear-gradient(135deg, #e8ecef 0%, #c8d0d8 100%)";
    case "dark":
      return "linear-gradient(135deg, #0a0e12 0%, #1a1f25 100%)";
    case "outdoors":
      return "linear-gradient(135deg, #2a4030 0%, #4a5030 100%)";
    default:
      return "linear-gradient(135deg, #1a1f25 0%, #2a2f35 100%)";
  }
}
