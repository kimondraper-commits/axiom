"use client";

import { useState } from "react";
import type { FullProject } from "../project-tabs";

const NSW_STATUSES = [
  "Pre-lodgement",
  "Under Assessment",
  "On Exhibition",
  "Approved",
  "Refused",
  "Under Construction",
  "Completed",
];

const NSW_STATUS_STYLES: Record<string, React.CSSProperties> = {
  "Pre-lodgement":      { background: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  "Under Assessment":   { background: "rgba(200,164,78,0.12)", color: "#c8a44e" },
  "On Exhibition":      { background: "rgba(168,85,247,0.12)", color: "#a855f7" },
  "Approved":           { background: "rgba(34,197,94,0.12)",  color: "#22c55e" },
  "Refused":            { background: "rgba(239,68,68,0.12)",  color: "#ef4444" },
  "Under Construction": { background: "rgba(249,115,22,0.12)", color: "#f97316" },
  "Completed":          { background: "rgba(16,185,129,0.12)", color: "#10b981" },
};

function calcImpacts(p: FullProject) {
  const dwellings = p.dwellings ?? 0;
  const commercialGfa = p.commercialGfa ?? 0;
  const siteAreaHa = p.siteAreaHa ?? 0;
  const constructionCostM = p.constructionCostM ?? 0;
  const greenSpaceHa = p.greenSpaceHa ?? 0;

  const population = dwellings * 2.53;
  const popDensity = siteAreaHa > 0 ? population / (siteAreaHa / 100) : 0;
  const constructionFTEs = constructionCostM * 9;
  const ongoingJobs = dwellings * 0.35 + commercialGfa / 25;

  let score = 0;
  if (popDensity > 5000) score += 25;
  else if (popDensity > 2000) score += 15;
  else if (popDensity > 500) score += 8;
  if (commercialGfa > 0) score += 20;
  if (greenSpaceHa > 0 && siteAreaHa > 0) {
    score += Math.min(25, (greenSpaceHa / siteAreaHa) * 100);
  }
  if (dwellings > 0) score += 20;
  score = Math.min(100, Math.round(score));

  return { population, constructionFTEs, ongoingJobs, sustainabilityScore: score };
}

export function OverviewTab({
  project,
  canEdit,
  onUpdate,
}: {
  project: FullProject;
  canEdit: boolean;
  onUpdate: (updates: Partial<FullProject>) => void;
}) {
  const [savingStatus, setSavingStatus] = useState(false);
  const impacts = calcImpacts(project);
  const openCompliance = project.complianceItems.filter((c) => !c.checked).length;

  const daysElapsed = project.lodgementDate
    ? Math.floor((Date.now() - new Date(project.lodgementDate).getTime()) / 86_400_000)
    : null;

  async function handleNswStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nswStatus = e.target.value;
    setSavingStatus(true);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nswStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate({ nswStatus: data.data.nswStatus });
    }
    setSavingStatus(false);
  }

  return (
    <div className="space-y-6">
      {/* NSW Status + KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 16 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 8 }}>NSW Status</div>
          {canEdit ? (
            <select
              value={project.nswStatus ?? ""}
              onChange={handleNswStatusChange}
              disabled={savingStatus}
              className="w-full"
            >
              <option value="">— Select —</option>
              {NSW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span
              style={{
                ...(project.nswStatus ? (NSW_STATUS_STYLES[project.nswStatus] ?? { background: "var(--slate)", color: "var(--text-ghost)" }) : { background: "var(--slate)", color: "var(--text-ghost)" }),
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 9999,
                fontWeight: 500,
              }}
            >
              {project.nswStatus ?? "Not set"}
            </span>
          )}
        </div>

        <KpiCard label="Est. Population" value={impacts.population > 0 ? Math.round(impacts.population).toLocaleString("en-AU") : "—"} sub="residents" />
        <KpiCard label="Jobs Generated" value={Math.round(impacts.constructionFTEs + impacts.ongoingJobs).toLocaleString("en-AU")} sub="construction + ongoing" />
        <KpiCard label="Sustainability Score" value={project.dwellings || project.siteAreaHa ? `${impacts.sustainabilityScore}/100` : "—"} sub={impacts.sustainabilityScore >= 70 ? "Strong" : impacts.sustainabilityScore >= 40 ? "Moderate" : "Low"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 16 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>Open Compliance Items</div>
          <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)" }}>{openCompliance}</div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>of {project.complianceItems.length} total</div>
        </div>

        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 16 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>Days Since Lodgement</div>
          <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)" }}>{daysElapsed !== null ? daysElapsed : "—"}</div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>
            {project.lodgementDate ? new Date(project.lodgementDate).toLocaleDateString("en-AU") : "No lodgement date set"}
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 20 }}>
        <h3 style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 500, color: "var(--text-primary)", marginBottom: 16 }}>Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3" style={{ fontSize: 13 }}>
          {[
            ["Address", project.address],
            ["LGA", project.lga],
            ["Type", project.projectType],
            ["Applicant", project.applicantName],
            ["Email", project.applicantEmail],
            ["Dwellings", project.dwellings?.toString()],
            ["Commercial GFA", project.commercialGfa ? `${project.commercialGfa.toLocaleString()} m²` : null],
            ["Building Height", project.buildingHeight ? `${project.buildingHeight} m` : null],
            ["Storeys", project.storeys?.toString()],
            ["Car Parking", project.carParking?.toString()],
            ["Site Area", project.siteAreaHa ? `${project.siteAreaHa} ha` : null],
            ["Construction Cost", project.constructionCostM ? `$${project.constructionCostM}M` : null],
            ["Green Space", project.greenSpaceHa ? `${project.greenSpaceHa} ha` : null],
            ["Budget", project.budget ? `$${project.budget.toLocaleString()}` : null],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label as string} className="flex justify-between gap-2">
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500, textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 20 }}>
        <h3 style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 500, color: "var(--text-primary)", marginBottom: 12 }}>Team ({project.members.length})</h3>
        <ul className="space-y-2">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>{m.user.name ?? m.user.email}</span>
              <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>{m.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 16 }}>
      <div style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>{sub}</div>
    </div>
  );
}
