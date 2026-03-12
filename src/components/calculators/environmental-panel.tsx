"use client";

import { useState, useMemo, useCallback } from "react";
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
      <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)" }}>
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

  const [lat, setLat] = useState(-33.8688);
  const [lng, setLng] = useState(151.2093);
  const [rainfallLoading, setRainfallLoading] = useState(false);
  const [rainfallSource, setRainfallSource] = useState<string | null>(null);
  const [rainfallError, setRainfallError] = useState<string | null>(null);

  const fetchRainfall = useCallback(async () => {
    setRainfallLoading(true);
    setRainfallError(null);
    try {
      const res = await fetch(`/api/data-sources/silo?lat=${lat}&lng=${lng}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setRainfallMm(json.data.annualRainfallMm);
      setRainfallSource(
        `SILO: ${json.data.annualRainfallMm}mm (${json.data.rainDays} rain days, ${json.data.periodDays}-day period)`
      );
    } catch (err) {
      setRainfallError(err instanceof Error ? err.message : "Failed to fetch");
      setRainfallMm(DEFAULT_RAINFALL_MM);
      setRainfallSource(null);
    } finally {
      setRainfallLoading(false);
    }
  }, [lat, lng]);

  const results = useMemo(() => {
    const imperviousHa = siteHa * (coveragePct / 100);
    const annualStormwaterMl = imperviousHa * rainfallMm * RUNOFF_COEFFICIENT / 1000;
    const operationalCo2e = dwellings * CO2E_RESIDENTIAL_PER_DW + commercialGfa * CO2E_COMMERCIAL_PER_M2;
    const annualWaterMl = dwellings * WATER_DEMAND_PER_DW_ML;
    const treeReplacement = removedTrees * TREE_REPLACEMENT_RATIO;
    return { imperviousHa, annualStormwaterMl, operationalCo2e, annualWaterMl, treeReplacement };
  }, [siteHa, coveragePct, rainfallMm, dwellings, commercialGfa, removedTrees]);

  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 };
  const helperStyle: React.CSSProperties = { fontSize: 11, color: "var(--text-ghost)", marginTop: 2 };

  return (
    <div className="flex gap-6">
      <div className="w-2/5 space-y-4">
        <div><label style={labelStyle}>Site area (ha)</label><input type="number" value={siteHa} onChange={(e) => setSiteHa(Number(e.target.value))} min={0} step={0.5} className="w-full" /></div>
        <div><label style={labelStyle}>Impervious coverage (%)</label><input type="number" value={coveragePct} onChange={(e) => setCoveragePct(Number(e.target.value))} min={0} max={100} step={1} className="w-full" /><p style={helperStyle}>Roads, roofs, paving</p></div>

        {/* Rainfall with SILO integration */}
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <label style={labelStyle}>Annual rainfall (mm)</label>
          <input type="number" value={rainfallMm} onChange={(e) => setRainfallMm(Number(e.target.value))} min={0} step={10} className="w-full" />
          <p style={helperStyle}>Default {DEFAULT_RAINFALL_MM}mm — Sydney Observatory Hill avg</p>

          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <label style={{ ...labelStyle, fontSize: 11 }}>Latitude</label>
              <input type="number" value={lat} onChange={(e) => setLat(Number(e.target.value))} step={0.001} className="w-full" style={{ fontSize: 12, padding: "6px 10px" }} />
            </div>
            <div className="flex-1">
              <label style={{ ...labelStyle, fontSize: 11 }}>Longitude</label>
              <input type="number" value={lng} onChange={(e) => setLng(Number(e.target.value))} step={0.001} className="w-full" style={{ fontSize: 12, padding: "6px 10px" }} />
            </div>
          </div>
          <button
            onClick={fetchRainfall}
            disabled={rainfallLoading}
            className="mt-2 w-full py-2 text-sm rounded-md border font-medium transition-colors"
            style={{
              background: rainfallLoading
                ? "var(--bg-tertiary)"
                : "linear-gradient(135deg, var(--gold-dim), var(--gold))",
              color: rainfallLoading ? "var(--text-ghost)" : "var(--void)",
              borderColor: "var(--gold)",
              cursor: rainfallLoading ? "wait" : "pointer",
            }}
          >
            {rainfallLoading ? "Fetching..." : "Fetch from SILO"}
          </button>
          {rainfallSource && (
            <p style={{ fontSize: 11, color: "var(--status-success)", marginTop: 4 }}>
              {rainfallSource}
            </p>
          )}
          {rainfallError && (
            <p style={{ fontSize: 11, color: "var(--status-error)", marginTop: 4 }}>
              {rainfallError} — using default {DEFAULT_RAINFALL_MM}mm
            </p>
          )}
          <p style={{ fontSize: 10, color: "var(--text-ghost)", marginTop: 4 }}>
            Rainfall data: SILO, Queensland Government (longpaddock.qld.gov.au)
          </p>
        </div>

        <div><label style={labelStyle}>Residential dwellings</label><input type="number" value={dwellings} onChange={(e) => setDwellings(Number(e.target.value))} min={0} className="w-full" /></div>
        <div><label style={labelStyle}>Commercial GFA (m²)</label><input type="number" value={commercialGfa} onChange={(e) => setCommercialGfa(Number(e.target.value))} min={0} step={100} className="w-full" /></div>
        <div><label style={labelStyle}>Trees to be removed</label><input type="number" value={removedTrees} onChange={(e) => setRemovedTrees(Number(e.target.value))} min={0} className="w-full" /></div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Impervious surface" value={fmt(results.imperviousHa)} unit="ha" note="site_ha x coverage% / 100" />
          <ResultCard label="Annual stormwater runoff" value={fmt(results.annualStormwaterMl)} unit="ML/yr" note="impervious_ha x rainfall_mm x 0.85 (runoff coeff.) / 1000" />
          <ResultCard label="Operational CO₂e" value={fmt(results.operationalCo2e)} unit="tCO₂e/yr" note="dwellings x 4.5 + commercial_gfa x 0.12 t/m²" />
          <ResultCard label="Annual water demand" value={fmt(results.annualWaterMl)} unit="ML/yr" note="dwellings x 0.1665 ML (180 L/person/day x 2.53 pph)" />
          <div className="col-span-2">
            <ResultCard label="Tree replacement requirement" value={fmt(results.treeReplacement, 0)} unit="trees" note="removed_trees x 3 (3:1 replacement standard — NSW biodiversity offset)" />
          </div>
        </div>

        {/* Methodology note */}
        <div className="mt-4" style={{ background: "var(--carbon)", border: "1px solid var(--border-active)", borderRadius: 8, padding: 16 }}>
          <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>Methodology note</p>
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
