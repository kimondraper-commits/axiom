"use client";

import { useState, useMemo } from "react";
import { FTE_PER_MILLION, RESIDENTIAL_FTE, COMMERCIAL_DENSITY_M2, RETAIL_SPEND_PER_PERSON, AVG_SALARY } from "@/lib/reference-data";

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

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: decimals });
}

function fmtDollar(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${fmt(n)}`;
}

export function EconomicPanel() {
  const [projectCostM, setProjectCostM] = useState(50);
  const [dwellings, setDwellings] = useState(500);
  const [commercialGfa, setCommercialGfa] = useState(2000);
  const [estimatedPop, setEstimatedPop] = useState(1265);
  const [landValueM, setLandValueM] = useState(10);
  const [ratePct, setRatePct] = useState(0.8);

  const results = useMemo(() => {
    const constructionFtes = projectCostM * FTE_PER_MILLION;
    const ongoingResidential = dwellings * RESIDENTIAL_FTE;
    const ongoingCommercial = commercialGfa > 0 ? commercialGfa / COMMERCIAL_DENSITY_M2 : 0;
    const totalJobs = constructionFtes + ongoingResidential + ongoingCommercial;
    const retailSpending = estimatedPop * RETAIL_SPEND_PER_PERSON;
    const annualRates = landValueM * 1_000_000 * (ratePct / 100);
    const tenYrContribution = projectCostM * 1_000_000 + totalJobs * AVG_SALARY * 10;
    return { constructionFtes, ongoingResidential, ongoingCommercial, totalJobs, retailSpending, annualRates, tenYrContribution };
  }, [projectCostM, dwellings, commercialGfa, estimatedPop, landValueM, ratePct]);

  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 };
  const helperStyle: React.CSSProperties = { fontSize: 11, color: "var(--text-ghost)", marginTop: 2 };

  return (
    <div className="flex gap-6">
      <div className="w-2/5 space-y-4">
        <div>
          <label style={labelStyle}>Project construction cost ($M AUD)</label>
          <input type="number" value={projectCostM} onChange={(e) => setProjectCostM(Number(e.target.value))} min={0} step={1} className="w-full" />
          <p style={helperStyle}>Enter value in millions (e.g. 50 = $50M)</p>
        </div>
        <div>
          <label style={labelStyle}>Residential dwellings</label>
          <input type="number" value={dwellings} onChange={(e) => setDwellings(Number(e.target.value))} min={0} className="w-full" />
        </div>
        <div>
          <label style={labelStyle}>Commercial GFA (m²)</label>
          <input type="number" value={commercialGfa} onChange={(e) => setCommercialGfa(Number(e.target.value))} min={0} step={100} className="w-full" />
          <p style={helperStyle}>Gross floor area for commercial use</p>
        </div>
        <div>
          <label style={labelStyle}>Estimated population</label>
          <input type="number" value={estimatedPop} onChange={(e) => setEstimatedPop(Number(e.target.value))} min={0} className="w-full" />
          <p style={helperStyle}>Use Population calculator result</p>
        </div>
        <div>
          <label style={labelStyle}>Land value ($M AUD)</label>
          <input type="number" value={landValueM} onChange={(e) => setLandValueM(Number(e.target.value))} min={0} step={0.5} className="w-full" />
        </div>
        <div>
          <label style={labelStyle}>Council rate (%)</label>
          <input type="number" value={ratePct} onChange={(e) => setRatePct(Number(e.target.value))} min={0} max={5} step={0.05} className="w-full" />
          <p style={helperStyle}>Typical range 0.5–1.2%</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Construction FTEs" value={fmt(results.constructionFtes)} unit="FTE" note="project_cost_M × 9 (ABS ~9 FTE per $1M construction)" />
          <ResultCard label="Ongoing residential jobs" value={fmt(results.ongoingResidential, 1)} unit="FTE" note="dwellings × 0.35 local employment multiplier" />
          <ResultCard label="Ongoing commercial jobs" value={fmt(results.ongoingCommercial, 1)} unit="FTE" note="commercial_gfa ÷ 25 m² per employee" />
          <ResultCard label="Total jobs generated" value={fmt(results.totalJobs, 1)} unit="FTE" note="Construction + ongoing residential + commercial" />
          <ResultCard label="Annual retail spending" value={fmtDollar(results.retailSpending)} unit="/yr" note="pop × $18,000/person/yr (ABS household spending avg)" />
          <ResultCard label="Annual council rates" value={fmtDollar(results.annualRates)} unit="/yr" note={`land_value × ${ratePct}% council rate`} />
          <div className="col-span-2">
            <ResultCard label="10-year economic contribution" value={fmtDollar(results.tenYrContribution)} unit="(GVA basis)" note="project_cost + (total_jobs × $95k avg salary × 10 yr)" />
          </div>
        </div>
      </div>
    </div>
  );
}
