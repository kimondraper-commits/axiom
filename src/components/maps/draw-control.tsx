"use client";

import { useControl } from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useEffect } from "react";

interface DrawControlProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  displayControlsDefault?: boolean;
  controls?: Record<string, boolean>;
  defaultMode?: string;
  onCreate?: (e: { features: GeoJSON.Feature[] }) => void;
  onUpdate?: (e: { features: GeoJSON.Feature[]; action: string }) => void;
  onDelete?: (e: { features: GeoJSON.Feature[] }) => void;
  drawRef?: React.MutableRefObject<MapboxDraw | null>;
}

/**
 * Wraps mapbox-gl-draw as a react-map-gl control. Exposes the underlying
 * draw instance through `drawRef` so the parent can call `changeMode`,
 * `getAll`, `deleteAll`, etc.
 */
export function DrawControl(props: DrawControlProps) {
  const draw = useControl<MapboxDraw>(
    () =>
      new MapboxDraw({
        displayControlsDefault: props.displayControlsDefault ?? false,
        controls: props.controls ?? {},
        defaultMode: props.defaultMode ?? "simple_select",
        styles: DRAW_STYLES,
      }),
    ({ map }) => {
      if (props.onCreate) map.on("draw.create", props.onCreate as any);
      if (props.onUpdate) map.on("draw.update", props.onUpdate as any);
      if (props.onDelete) map.on("draw.delete", props.onDelete as any);
    },
    ({ map }) => {
      if (props.onCreate) map.off("draw.create", props.onCreate as any);
      if (props.onUpdate) map.off("draw.update", props.onUpdate as any);
      if (props.onDelete) map.off("draw.delete", props.onDelete as any);
    },
    { position: props.position ?? "top-left" }
  );

  useEffect(() => {
    if (props.drawRef) props.drawRef.current = draw;
  }, [draw, props.drawRef]);

  return null;
}

// AXIOM-themed draw styles (green accent, dark fills)
const DRAW_STYLES: any[] = [
  // Active line
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#00e87b",
      "line-dasharray": [0.2, 2],
      "line-width": 2.5,
    },
  },
  // Polygon fill
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: {
      "fill-color": "#00e87b",
      "fill-outline-color": "#00e87b",
      "fill-opacity": 0.12,
    },
  },
  // Polygon outline
  {
    id: "gl-draw-polygon-stroke",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#00e87b",
      "line-dasharray": [0.2, 2],
      "line-width": 2.5,
    },
  },
  // Vertex points (active)
  {
    id: "gl-draw-polygon-and-line-vertex-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    paint: {
      "circle-radius": 5,
      "circle-color": "#00e87b",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#04060a",
    },
  },
  // Midpoints (between vertices)
  {
    id: "gl-draw-polygon-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 3,
      "circle-color": "#00e87b",
    },
  },
  // Static (finished features)
  {
    id: "gl-draw-line-static",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#00e87b", "line-width": 2.5 },
  },
  {
    id: "gl-draw-polygon-fill-static",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    paint: { "fill-color": "#00e87b", "fill-opacity": 0.12 },
  },
  {
    id: "gl-draw-polygon-stroke-static",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#00e87b", "line-width": 2.5 },
  },
];
