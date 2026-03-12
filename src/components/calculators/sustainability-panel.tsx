"use client";

import { useState, useMemo } from "react";
import { DWELLING_SIZE_M2, DENSITY_THRESHOLD_DW_HA } from "@/lib/reference-data";

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

const RATING_CONFIG: Record<string, { bg: string; text: string; border: string; desc: string }> = {
  Excellent: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.3)", desc: "Score ≥ 80 — Best-practice sustainable development" },
  Good:      { bg: "rgba(200,164,78,0.1)", text: "#c8a44e", border: "rgba(200,164,78,0.3)", desc: "Score 60–79 — Strong performance across indicators" },
  Moderate:  { bg: "rgba(234,179,8,0.1)",  text: "#eab308", border: "rgba(234,179,8,0.3)",  desc: "Score 40–59 — Meets baseline, room for improvement" },
  Low:       { bg: "rgba(249,115,22,0.1)", text: "#f97316", border: "rgba(249,115,22,0.3)", desc: "Score 20–39 — Falls short on multiple metrics" },
  Poor:      { bg: "rgba(239,68,68,0.1)",  text: "#ef4444", border: "rgba(239,68,68,0.3)",  desc: "Score < 20 — Significant sustainability concerns" },
};

type Rating = keyof typeof RATING_CONFIG;

function getRating(score: number): Rating {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low";
  return "Poor";
}

export function SustainabilityPanel() {
  const [dwellings, setDwellings] = useState(200);
  const [siteHa, setSiteHa] = useState(5);
  const [commercialGfa, setCommercialGfa] = useState(1000);
  const [greenHa, setGreenHa] = useState(0.8);
  const [totalJobs, setTotalJobs] = useState(120);
  const [distanceTrainM, setDistanceTrainM] = useState(600);
  const [distanceBusM, setDistanceBusM] = useState(200);
  const [hasMixedUse, setHasMixedUse] = useState(true);

  const results = useMemo(() => {
    const residentialDensity = siteHa > 0 ? dwellings / siteHa : 0;
    const fsr = siteHa > 0 ? (dwellings * DWELLING_SIZE_M2 + commercialGfa) / (siteHa * 10_000) : 0;
    const greenSpaceRatio = siteHa > 0 ? (greenHa / siteHa) * 100 : 0;
    const jobsHousing = dwellings > 0 ? totalJobs / dwellings : 0;

    const trainScore = Math.max(0, 100 - distanceTrainM / 10);
    const busScore = Math.max(0, 100 - distanceBusM / 4);
    const transitScore = Math.round(trainScore * 0.6 + busScore * 0.4);

    const densityScore = Math.min(25, (residentialDensity / DENSITY_THRESHOLD_DW_HA) * 25);
    const greenScore = Math.min(25, greenSpaceRatio);
    const mixedUseScore = hasMixedUse ? 20 : 0;
    const walkabilityScore = Math.round(densityScore + (transitScore * 0.30) + greenScore + mixedUseScore);

    const densitySubScore = Math.min(100, (residentialDensity / 100) * 100);
    const greenSubScore = Math.min(100, greenSpaceRatio * 2);
    const jhbSubScore = jobsHousing >= 0.3 && jobsHousing <= 2 ? 100 : Math.max(0, 100 - Math.abs(jobsHousing - 1) * 50);
    const compositeScore = Math.round(
      densitySubScore * 0.2 + transitScore * 0.25 + greenSubScore * 0.2 + walkabilityScore * 0.2 + jhbSubScore * 0.15
    );

    const rating = getRating(compositeScore);

    return { residentialDensity, fsr, greenSpaceRatio, jobsHousing, transitScore, walkabilityScore, compositeScore, rating };
  }, [dwellings, siteHa, commercialGfa, greenHa, totalJobs, distanceTrainM, distanceBusM, hasMixedUse]);

  const ratingStyle = RATING_CONFIG[results.rating];
  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 };

  return (
    <div className="flex gap-6">
      {/* Inputs */}
      <div className="w-2/5 space-y-4">
        <div><label style={labelStyle}>Dwellings</label><input type="number" value={dwellings} onChange={(e) => setDwellings(Number(e.target.value))} min={0} className="w-full" /></div>
        <div><label style={labelStyle}>Site area (ha)</label><input type="number" value={siteHa} onChange={(e) => setSiteHa(Number(e.target.value))} min={0} step={0.5} className="w-full" /></div>
        <div><label style={labelStyle}>Commercial GFA (m²)</label><input type="number" value={commercialGfa} onChange={(e) => setCommercialGfa(Number(e.target.value))} min={0} step={100} className="w-full" /></div>
        <div><label style={labelStyle}>Green space (ha)</label><input type="number" value={greenHa} onChange={(e) => setGreenHa(Number(e.target.value))} min={0} step={0.1} className="w-full" /></div>
        <div><label style={labelStyle}>Total jobs on site</label><input type="number" value={totalJobs} onChange={(e) => setTotalJobs(Number(e.target.value))} min={0} className="w-full" /></div>
        <div><label style={labelStyle}>Distance to nearest train station (m)</label><input type="number" value={distanceTrainM} onChange={(e) => setDistanceTrainM(Number(e.target.value))} min={0} step={50} className="w-full" /></div>
        <div><label style={labelStyle}>Distance to nearest bus stop (m)</label><input type="number" value={distanceBusM} onChange={(e) => setDistanceBusM(Number(e.target.value))} min={0} step={25} className="w-full" /></div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="mixedUse" checked={hasMixedUse} onChange={(e) => setHasMixedUse(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="mixedUse" style={{ fontSize: 12, color: "var(--text-secondary)" }}>Includes mixed-use (retail / commercial at ground level)</label>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-4">
        {/* Composite rating badge */}
        <div style={{ border: `1px solid ${ratingStyle.border}`, borderRadius: 8, padding: 20, background: ratingStyle.bg }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: ratingStyle.text, marginBottom: 4 }}>
                Composite sustainability rating
              </p>
              <p style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 32, color: ratingStyle.text }}>{results.rating}</p>
              <p style={{ fontSize: 13, color: ratingStyle.text, opacity: 0.8, marginTop: 4 }}>{ratingStyle.desc}</p>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 48, color: ratingStyle.text }}>{results.compositeScore}</p>
              <p style={{ fontSize: 12, color: ratingStyle.text, opacity: 0.7 }}>/ 100</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Residential density" value={fmt(results.residentialDensity)} unit="dw/ha" note="dwellings ÷ site_ha" />
          <ResultCard label="Floor space ratio (FSR)" value={fmt(results.fsr, 2)} unit=":1" note="(dw × 120m² + commercial_gfa) ÷ (site_ha × 10,000)" />
          <ResultCard label="Green space ratio" value={fmt(results.greenSpaceRatio)} unit="%" note="green_ha ÷ site_ha × 100" />
          <ResultCard label="Jobs-housing balance" value={fmt(results.jobsHousing, 2)} unit="jobs/dw" note="total_jobs ÷ dwellings (optimal: 0.3–2.0)" />
          <ResultCard label="Transit score" value={fmt(results.transitScore, 0)} unit="/ 100" note="Inverse-distance from train (60%) + bus (40%)" />
          <ResultCard label="Walkability score" value={fmt(results.walkabilityScore, 0)} unit="/ 100" note="Composite: density + transit + green space + mixed-use" />
        </div>
      </div>
    </div>
  );
}
