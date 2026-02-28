"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ABS_AVG_HOUSEHOLD_SIZE, ABS_GROWTH_RATE_PCT } from "@/lib/reference-data";

function ResultCard({ label, value, unit, note }: { label: string; value: string; unit: string; note: string }) {
  return (
    <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
      <p style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)" }}>
        {value} <span style={{ fontWeight: 300, fontSize: 14, color: "var(--text-secondary)", marginLeft: 4 }}>{unit}</span>
      </p>
      <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }}>{note}</p>
    </div>
  );
}

export function PopulationPanel() {
  const [dwellings, setDwellings] = useState(500);
  const [householdSize, setHouseholdSize] = useState(ABS_AVG_HOUSEHOLD_SIZE);
  const [areaHa, setAreaHa] = useState(20);
  const [densityDwPerHa, setDensityDwPerHa] = useState(25);
  const [growthRate, setGrowthRate] = useState(ABS_GROWTH_RATE_PCT);
  const [method, setMethod] = useState<"dwelling" | "land">("dwelling");

  const results = useMemo(() => {
    const pop =
      method === "dwelling"
        ? dwellings * householdSize
        : areaHa * densityDwPerHa * householdSize;

    const effectiveDwellings = method === "land" ? areaHa * densityDwPerHa : dwellings;
    const areaKm2 = areaHa / 100;
    const density = areaKm2 > 0 ? pop / areaKm2 : 0;

    const projections = [0, 5, 10, 15, 20, 25, 30].map((t) => ({
      year: new Date().getFullYear() + t,
      population: Math.round(pop * Math.pow(1 + growthRate / 100, t)),
    }));

    return { pop: Math.round(pop), effectiveDwellings: Math.round(effectiveDwellings), density: Math.round(density), projections };
  }, [dwellings, householdSize, areaHa, densityDwPerHa, growthRate, method]);

  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 };
  const helperStyle: React.CSSProperties = { fontSize: 11, color: "var(--text-ghost)", marginTop: 2 };

  return (
    <div className="flex gap-6">
      {/* Inputs */}
      <div className="w-2/5 space-y-5">
        <div>
          <label style={labelStyle}>Estimation method</label>
          <div className="flex gap-2">
            {(["dwelling", "land"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className="flex-1 py-2 text-sm rounded-md border font-medium transition-colors"
                style={method === m
                  ? { background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", borderColor: "var(--gold)" }
                  : { background: "var(--slate)", color: "var(--text-secondary)", borderColor: "var(--border)" }
                }
              >
                {m === "dwelling" ? "Dwelling count" : "Land area"}
              </button>
            ))}
          </div>
        </div>

        {method === "dwelling" ? (
          <div>
            <label style={labelStyle}>Number of dwellings</label>
            <input type="number" value={dwellings} onChange={(e) => setDwellings(Number(e.target.value))} min={0} className="w-full" />
          </div>
        ) : (
          <>
            <div>
              <label style={labelStyle}>Site area (ha)</label>
              <input type="number" value={areaHa} onChange={(e) => setAreaHa(Number(e.target.value))} min={0} step={0.5} className="w-full" />
            </div>
            <div>
              <label style={labelStyle}>Dwelling density (dw/ha)</label>
              <input type="number" value={densityDwPerHa} onChange={(e) => setDensityDwPerHa(Number(e.target.value))} min={0} step={1} className="w-full" />
            </div>
          </>
        )}

        <div>
          <label style={labelStyle}>Avg. household size (persons/dw)</label>
          <input type="number" value={householdSize} onChange={(e) => setHouseholdSize(Number(e.target.value))} min={1} max={10} step={0.01} className="w-full" />
          <p style={helperStyle}>Default 2.53 — ABS Census 2021</p>
        </div>

        <div>
          <label style={labelStyle}>Annual growth rate (%)</label>
          <input type="number" value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))} min={-5} max={20} step={0.1} className="w-full" />
        </div>

        {method === "land" && (
          <div>
            <label style={labelStyle}>Site area for density calc (ha)</label>
            <input type="number" value={areaHa} onChange={(e) => setAreaHa(Number(e.target.value))} min={0} step={0.5} className="w-full" />
          </div>
        )}

        {method === "dwelling" && (
          <div>
            <label style={labelStyle}>Site area (ha) — for density</label>
            <input type="number" value={areaHa} onChange={(e) => setAreaHa(Number(e.target.value))} min={0} step={0.5} className="w-full" />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Estimated population" value={results.pop.toLocaleString()} unit="persons" note="Dwelling × avg. household size (ABS 2021)" />
          <ResultCard label="Effective dwellings" value={results.effectiveDwellings.toLocaleString()} unit="dw" note={method === "land" ? "area_ha × density_dw_per_ha" : "Directly entered"} />
          <ResultCard label="Population density" value={results.density.toLocaleString()} unit="persons/km²" note="Estimated pop ÷ site area" />
          <ResultCard label="30-yr projection" value={results.projections[results.projections.length - 1].population.toLocaleString()} unit="persons" note={`At ${growthRate}% p.a. compound growth`} />
        </div>

        {/* Growth chart */}
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <p style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 12 }}>Population growth projection</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={results.projections} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,164,78,0.1)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "rgba(240,236,228,0.3)" }} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(240,236,228,0.3)" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip
                formatter={(value) => [typeof value === "number" ? value.toLocaleString() : value, "Population"]}
                contentStyle={{ fontSize: 12, background: "var(--graphite)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <Line type="monotone" dataKey="population" stroke="#c8a44e" strokeWidth={2} dot={{ fill: "#c8a44e", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
