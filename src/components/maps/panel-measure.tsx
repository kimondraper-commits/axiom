"use client";

import { IconLine, IconPolygon, IconTrash } from "./icons";

export type MeasureMode = "distance" | "area" | null;

interface MeasurePanelProps {
  mode: MeasureMode;
  onSetMode: (mode: MeasureMode) => void;
  onClear: () => void;
  result: { distance?: number; area?: number } | null;
}

export function MeasurePanel({
  mode,
  onSetMode,
  onClear,
  result,
}: MeasurePanelProps) {
  return (
    <div className="p-4 space-y-4">
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary, #c8d0d8)",
          lineHeight: 1.55,
        }}
      >
        Pick a tool, then click on the map to add points. Double-click to finish.
      </p>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSetMode(mode === "distance" ? null : "distance")}
          className="flex flex-col items-center gap-1.5 py-3 transition-colors"
          style={{
            borderRadius: 6,
            background:
              mode === "distance"
                ? "var(--gold-glow, rgba(0,232,123,0.12))"
                : "var(--void, #04060a)",
            color:
              mode === "distance"
                ? "var(--gold, #00e87b)"
                : "var(--text-secondary, #c8d0d8)",
            border:
              mode === "distance"
                ? "1px solid var(--gold, #00e87b)"
                : "1px solid var(--border, rgba(255,255,255,0.08))",
            cursor: "pointer",
          }}
        >
          <IconLine size={20} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>
            DISTANCE
          </span>
        </button>
        <button
          onClick={() => onSetMode(mode === "area" ? null : "area")}
          className="flex flex-col items-center gap-1.5 py-3 transition-colors"
          style={{
            borderRadius: 6,
            background:
              mode === "area"
                ? "var(--gold-glow, rgba(0,232,123,0.12))"
                : "var(--void, #04060a)",
            color:
              mode === "area"
                ? "var(--gold, #00e87b)"
                : "var(--text-secondary, #c8d0d8)",
            border:
              mode === "area"
                ? "1px solid var(--gold, #00e87b)"
                : "1px solid var(--border, rgba(255,255,255,0.08))",
            cursor: "pointer",
          }}
        >
          <IconPolygon size={20} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>
            AREA
          </span>
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className="p-3 space-y-1"
          style={{
            background: "var(--void, #04060a)",
            border: "1px solid var(--gold, #00e87b)",
            borderRadius: 6,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              fontSize: 9,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "var(--gold, #00e87b)",
            }}
          >
            Result
          </p>
          {result.distance !== undefined && (
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary, #ffffff)",
                fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              }}
            >
              {formatDistance(result.distance)}
            </p>
          )}
          {result.area !== undefined && (
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary, #ffffff)",
                fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              }}
            >
              {formatArea(result.area)}
            </p>
          )}
        </div>
      )}

      {/* Clear */}
      {(mode || result) && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 py-2"
          style={{
            borderRadius: 5,
            background: "transparent",
            color: "var(--text-ghost, #6c7680)",
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          <IconTrash size={13} />
          Clear measurement
        </button>
      )}
    </div>
  );
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters.toFixed(0)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatArea(sqMeters: number): string {
  if (sqMeters < 10_000) return `${sqMeters.toFixed(0)} m²`;
  if (sqMeters < 1_000_000) return `${(sqMeters / 10_000).toFixed(2)} ha`;
  return `${(sqMeters / 1_000_000).toFixed(2)} km²`;
}
