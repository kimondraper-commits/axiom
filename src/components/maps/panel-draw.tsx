"use client";

import { IconLine, IconPolygon, IconTrash } from "./icons";

export type DrawMode = "draw_line_string" | "draw_polygon" | null;

interface DrawPanelProps {
  mode: DrawMode;
  featureCount: number;
  onSetMode: (mode: DrawMode) => void;
  onClearAll: () => void;
  onExport: () => void;
}

export function DrawPanel({
  mode,
  featureCount,
  onSetMode,
  onClearAll,
  onExport,
}: DrawPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary, #c8d0d8)",
          lineHeight: 1.55,
        }}
      >
        Pick a tool and click on the map to start drawing. Double-click or press Enter to finish.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <ToolButton
          active={mode === "draw_line_string"}
          onClick={() => onSetMode(mode === "draw_line_string" ? null : "draw_line_string")}
          label="LINE"
          icon={<IconLine size={18} />}
        />
        <ToolButton
          active={mode === "draw_polygon"}
          onClick={() => onSetMode(mode === "draw_polygon" ? null : "draw_polygon")}
          label="POLYGON"
          icon={<IconPolygon size={18} />}
        />
      </div>

      <div
        className="p-3"
        style={{
          background: "var(--void, #04060a)",
          border: "1px solid var(--border, rgba(255,255,255,0.06))",
          borderRadius: 6,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              fontSize: 9,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "var(--text-ghost, #6c7680)",
            }}
          >
            Features
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--gold, #00e87b)",
            }}
          >
            {featureCount}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onExport}
          disabled={featureCount === 0}
          className="w-full py-2.5"
          style={{
            borderRadius: 5,
            background: featureCount > 0 ? "var(--gold, #00e87b)" : "var(--void, #04060a)",
            color: featureCount > 0 ? "var(--void, #04060a)" : "var(--text-ghost, #6c7680)",
            border: featureCount > 0 ? "none" : "1px solid var(--border, rgba(255,255,255,0.08))",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            cursor: featureCount > 0 ? "pointer" : "not-allowed",
          }}
        >
          EXPORT GEOJSON
        </button>
        <button
          onClick={onClearAll}
          disabled={featureCount === 0}
          className="w-full flex items-center justify-center gap-2 py-2"
          style={{
            borderRadius: 5,
            background: "transparent",
            color: "var(--text-ghost, #6c7680)",
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            fontSize: 11,
            cursor: featureCount > 0 ? "pointer" : "not-allowed",
            opacity: featureCount > 0 ? 1 : 0.5,
          }}
        >
          <IconTrash size={13} />
          Clear all
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 transition-colors"
      style={{
        borderRadius: 6,
        background: active
          ? "var(--gold-glow, rgba(0,232,123,0.12))"
          : "var(--void, #04060a)",
        color: active ? "var(--gold, #00e87b)" : "var(--text-secondary, #c8d0d8)",
        border: active
          ? "1px solid var(--gold, #00e87b)"
          : "1px solid var(--border, rgba(255,255,255,0.08))",
        cursor: "pointer",
      }}
    >
      {icon}
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>{label}</span>
    </button>
  );
}
