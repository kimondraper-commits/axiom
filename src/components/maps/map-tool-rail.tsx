"use client";

import {
  IconLayers,
  IconCube,
  IconPencil,
  IconRuler,
  IconClock,
  IconGlobe,
  IconCamera,
  IconExpand,
} from "./icons";

export type ToolId =
  | "layers"
  | "3d"
  | "draw"
  | "measure"
  | "isochrone"
  | "basemap"
  | "screenshot"
  | "fullscreen";

interface ToolRailProps {
  activeTool: ToolId | null;
  is3D: boolean;
  onSelect: (tool: ToolId) => void;
  onScreenshot: () => void;
  onFullscreen: () => void;
}

const TOOLS: { id: ToolId; label: string; Icon: typeof IconLayers }[] = [
  { id: "layers", label: "Layers", Icon: IconLayers },
  { id: "3d", label: "3D Mode", Icon: IconCube },
  { id: "draw", label: "Draw", Icon: IconPencil },
  { id: "measure", label: "Measure", Icon: IconRuler },
  { id: "isochrone", label: "Isochrone", Icon: IconClock },
  { id: "basemap", label: "Basemap", Icon: IconGlobe },
];

export function MapToolRail({
  activeTool,
  is3D,
  onSelect,
  onScreenshot,
  onFullscreen,
}: ToolRailProps) {
  return (
    <div
      className="absolute top-0 bottom-0 left-0 z-30 flex flex-col items-center py-3 gap-1"
      style={{
        width: 56,
        background: "var(--void, #04060a)",
        borderRight: "1px solid var(--border, rgba(255,255,255,0.06))",
      }}
    >
      {TOOLS.map(({ id, label, Icon }) => {
        const active =
          activeTool === id || (id === "3d" && is3D);
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className="group relative flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: active ? "var(--gold-glow, rgba(0,232,123,0.12))" : "transparent",
              color: active ? "var(--gold, #00e87b)" : "var(--text-ghost, #6c7680)",
              border: "none",
              cursor: "pointer",
              transition: "all 140ms ease",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = "rgba(0,232,123,0.06)";
                e.currentTarget.style.color = "var(--text-primary, #ffffff)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-ghost, #6c7680)";
              }
            }}
          >
            <Icon size={18} />
            {/* Tooltip */}
            <span
              className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded px-2 py-1 opacity-0 group-hover:opacity-100"
              style={{
                background: "var(--carbon, #0d1117)",
                color: "var(--text-primary, #ffffff)",
                fontSize: 11,
                fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                letterSpacing: 1,
                textTransform: "uppercase",
                border: "1px solid var(--border, rgba(255,255,255,0.06))",
                transition: "opacity 120ms",
                zIndex: 50,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}

      <div
        className="my-2 w-6"
        style={{ height: 1, background: "var(--border, rgba(255,255,255,0.06))" }}
      />

      <button
        onClick={onScreenshot}
        title="Screenshot"
        aria-label="Screenshot"
        className="group relative flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "transparent",
          color: "var(--text-ghost, #6c7680)",
          border: "none",
          cursor: "pointer",
          transition: "all 140ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,232,123,0.06)";
          e.currentTarget.style.color = "var(--text-primary, #ffffff)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-ghost, #6c7680)";
        }}
      >
        <IconCamera size={18} />
      </button>

      <button
        onClick={onFullscreen}
        title="Fullscreen"
        aria-label="Fullscreen"
        className="group relative flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "transparent",
          color: "var(--text-ghost, #6c7680)",
          border: "none",
          cursor: "pointer",
          transition: "all 140ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,232,123,0.06)";
          e.currentTarget.style.color = "var(--text-primary, #ffffff)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-ghost, #6c7680)";
        }}
      >
        <IconExpand size={18} />
      </button>
    </div>
  );
}
