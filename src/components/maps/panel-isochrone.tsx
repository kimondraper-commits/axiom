"use client";

import { useState } from "react";

interface IsochronePanelProps {
  onGenerate: (params: IsochroneParams) => void;
  onClear: () => void;
  hasResult: boolean;
}

export interface IsochroneParams {
  minutes: number[];
  profile: "walking" | "cycling" | "driving";
}

const PROFILES: { id: IsochroneParams["profile"]; label: string }[] = [
  { id: "walking", label: "Walk" },
  { id: "cycling", label: "Cycle" },
  { id: "driving", label: "Drive" },
];

const PRESETS = [
  { label: "5 min", value: [5] },
  { label: "10 min", value: [10] },
  { label: "15 min", value: [15] },
  { label: "5/10/15", value: [5, 10, 15] },
];

export function IsochronePanel({ onGenerate, onClear, hasResult }: IsochronePanelProps) {
  const [profile, setProfile] = useState<IsochroneParams["profile"]>("walking");
  const [preset, setPreset] = useState(2);

  return (
    <div className="p-4 space-y-4">
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary, #c8d0d8)",
          lineHeight: 1.55,
        }}
      >
        Click anywhere on the map to drop a marker, then choose how far you can travel from that point.
      </p>

      {/* Profile selector */}
      <div>
        <p
          className="mb-2"
          style={{
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            fontSize: 9,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "var(--text-ghost, #6c7680)",
          }}
        >
          Travel mode
        </p>
        <div className="grid grid-cols-3 gap-1">
          {PROFILES.map((p) => {
            const active = profile === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setProfile(p.id)}
                className="py-2 text-center transition-colors"
                style={{
                  borderRadius: 5,
                  background: active
                    ? "var(--gold-glow, rgba(0,232,123,0.12))"
                    : "var(--void, #04060a)",
                  color: active
                    ? "var(--gold, #00e87b)"
                    : "var(--text-secondary, #c8d0d8)",
                  border: active
                    ? "1px solid var(--gold, #00e87b)"
                    : "1px solid var(--border, rgba(255,255,255,0.08))",
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset selector */}
      <div>
        <p
          className="mb-2"
          style={{
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            fontSize: 9,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "var(--text-ghost, #6c7680)",
          }}
        >
          Time
        </p>
        <div className="grid grid-cols-2 gap-1">
          {PRESETS.map((p, i) => {
            const active = preset === i;
            return (
              <button
                key={p.label}
                onClick={() => setPreset(i)}
                className="py-2 text-center transition-colors"
                style={{
                  borderRadius: 5,
                  background: active
                    ? "var(--gold-glow, rgba(0,232,123,0.12))"
                    : "var(--void, #04060a)",
                  color: active
                    ? "var(--gold, #00e87b)"
                    : "var(--text-secondary, #c8d0d8)",
                  border: active
                    ? "1px solid var(--gold, #00e87b)"
                    : "1px solid var(--border, rgba(255,255,255,0.08))",
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => onGenerate({ minutes: PRESETS[preset].value, profile })}
          className="w-full py-2.5 transition-colors"
          style={{
            borderRadius: 5,
            background: "var(--gold, #00e87b)",
            color: "var(--void, #04060a)",
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            cursor: "pointer",
          }}
        >
          GENERATE ISOCHRONE
        </button>
        {hasResult && (
          <button
            onClick={onClear}
            className="w-full py-2 transition-colors"
            style={{
              borderRadius: 5,
              background: "transparent",
              color: "var(--text-ghost, #6c7680)",
              border: "1px solid var(--border, rgba(255,255,255,0.08))",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Clear result
          </button>
        )}
      </div>
    </div>
  );
}
