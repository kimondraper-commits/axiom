"use client";

import { useState, useMemo } from "react";
import {
  CO2E_RESIDENTIAL_PER_DW,
  CO2E_COMMERCIAL_PER_M2,
  WATER_DEMAND_PER_DW_ML,
  RUNOFF_COEFFICIENT,
  TREE_REPLACEMENT_RATIO,
  DEFAULT_RAINFALL_MM,
} from "@/lib/reference-data";

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

function fmt(n: number, decimals = 1) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: decimals });
}

export function EnvironmentalPanel() {
  const [siteHa, setSiteHa] = useState(5);
  const [coveragePct, setCoveragePct] = useState(60);
  const [rainfallMm, setRainfallMm] = useState(DEFAULT_RAINFALL_MM);
  const [dwellings, setDwellings] = useState(200);
  const [commercialGfa, setCommercialGfa] = useState(1000);
  const [removedTrees, setRemovedTrees] = useState(20);

  const results = useMemo(() => {
    const imperviousHa = siteHa * (coveragePct / 100);
    const annualStormwaterMl = imperviousHa * rainfallMm * RUNOFF_COEFFICIENT / 1000;
    const operationalCo2e = dwellings * CO2E_RESIDENTIAL_PER_DW + commercialGfa * CO2E_COMMERCIAL_PER_M2;
    const annualWaterMl = dwellings * WATER_DEMAND_PER_DW_ML;
    const treeReplacement = removedTrees * TREE_REPLACEMENT_RATIO;
    return { imperviousHa, annualStormwaterMl, operationalCo2e, annualWaterMl, treeReplacement };
  }, [siteHa, coveragePct, rainfallMm, dwellings, commercialGfa, removedTrees]);

  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 };
  const helperStyle: React.CSSProperties = { fontSize: 11, color: "var(--text-ghost)", marginTop: 2 };

  return (
    <div className="flex gap-6">
      <div className="w-2/5 space-y-4">
        <div><label style={labelStyle}>Site area (ha)</label><input type="number" value={siteHa} onChange={(e) => setSiteHa(Number(e.target.value))} min={0} step={0.5} className="w-full" /></div>
        <div><label style={labelStyle}>Impervious coverage (%)</label><input type="number" value={coveragePct} onChange={(e) => setCoveragePct(Number(e.target.value))} min={0} max={100} step={1} className="w-full" /><p style={helperStyle}>Roads, roofs, paving</p></div>
        <div><label style={labelStyle}>Annual rainfall (mm)</label><input type="number" value={rainfallMm} onChange={(e) => setRainfallMm(Number(e.target.value))} min={0} step={10} className="w-full" /><p style={helperStyle}>BOM long-term average</p></div>
        <div><label style={labelStyle}>Residential dwellings</label><input type="number" value={dwellings} onChange={(e) => setDwellings(Number(e.target.value))} min={0} className="w-full" /></div>
        <div><label style={labelStyle}>Commercial GFA (m²)</label><input type="number" value={commercialGfa} onChange={(e) => setCommercialGfa(Number(e.target.value))} min={0} step={100} className="w-full" /></div>
        <div><label style={labelStyle}>Trees to be removed</label><input type="number" value={removedTrees} onChange={(e) => setRemovedTrees(Number(e.target.value))} min={0} className="w-full" /></div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Impervious surface" value={fmt(results.imperviousHa)} unit="ha" note="site_ha × coverage% ÷ 100" />
          <ResultCard label="Annual stormwater runoff" value={fmt(results.annualStormwaterMl)} unit="ML/yr" note="impervious_ha × rainfall_mm × 0.85 (runoff coeff.) ÷ 1000" />
          <ResultCard label="Operational CO₂e" value={fmt(results.operationalCo2e)} unit="tCO₂e/yr" note="dwellings × 4.5 + commercial_gfa × 0.12 t/m²" />
          <ResultCard label="Annual water demand" value={fmt(results.annualWaterMl)} unit="ML/yr" note="dwellings × 0.1665 ML (180 L/person/day × 2.53 pph)" />
          <div className="col-span-2">
            <ResultCard label="Tree replacement requirement" value={fmt(results.treeReplacement, 0)} unit="trees" note="removed_trees × 3 (3:1 replacement standard — NSW biodiversity offset)" />
          </div>
        </div>

        {/* Carbon context note */}
        <div className="mt-4" style={{ background: "var(--carbon)", border: "1px solid var(--border-active)", borderRadius: 8, padding: 16 }}>
          <p style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>Methodology note</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            CO₂e emission factors sourced from Australian National Greenhouse Accounts (DCCEW 2023).
            Residential: 4.5 tCO₂e/dw/yr includes Scope 1 (gas) + Scope 2 (electricity) based on average household consumption.
            Commercial: 0.12 tCO₂e/m²/yr (office/retail baseline). Stormwater runoff coefficient 0.85 applies to high-density
            urban surfaces (MUSIC/ARR default).
          </p>
        </div>
      </div>
    </div>
  );
}
