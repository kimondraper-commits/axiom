"use client";

import { useState } from "react";
import Link from "next/link";
import type { ImportResult } from "@/lib/import/types";

interface Props {
  result: ImportResult | null;
  loading: boolean;
  apiError: string | null;
  rowCount: number;
  onStartNew: () => void;
}

export function StageDistribute({ result, loading, apiError, rowCount, onStartNew }: Props) {
  const [errorsOpen, setErrorsOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: "4px solid var(--gold)", borderTopColor: "transparent" }} />
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Importing {rowCount} project{rowCount !== 1 ? "s" : ""}…</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, padding: 16, borderRadius: 3 }}>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>Import failed</p>
        <p>{apiError}</p>
        <button
          onClick={onStartNew}
          style={{ marginTop: 12, fontSize: 13, color: "#ef4444", textDecoration: "underline" }}
        >
          Start new import
        </button>
      </div>
    );
  }

  if (!result) return null;

  const { projectsCreated, projectsUpdated, errorCount, errors, calcSummary } = result;

  return (
    <div>
      {/* Results card */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 16 }}>Import Complete</h3>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 3, padding: 16 }} className="text-center">
            <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 24, color: "#4ade80" }}>{projectsCreated}</div>
            <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }}>Created</div>
          </div>
          <div style={{ background: "var(--gold-glow)", border: "1px solid var(--border-active)", borderRadius: 3, padding: 16 }} className="text-center">
            <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 24, color: "var(--gold)" }}>{projectsUpdated}</div>
            <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }}>Updated</div>
          </div>
          <div style={{ background: errorCount > 0 ? "rgba(239,68,68,0.08)" : "var(--slate)", border: `1px solid ${errorCount > 0 ? "rgba(239,68,68,0.2)" : "var(--border)"}`, borderRadius: 3, padding: 16 }} className="text-center">
            <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 24, color: errorCount > 0 ? "#f87171" : "var(--text-ghost)" }}>{errorCount}</div>
            <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }}>Errors</div>
          </div>
        </div>

        {/* Calc summary */}
        {calcSummary && (
          <div style={{ background: "var(--gold-glow)", border: "1px solid var(--border-active)", borderRadius: 3, padding: 16, marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 12 }}>Aggregate Impact Estimates</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>{calcSummary.population.toLocaleString("en-AU")}</div>
                <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>Est. Population</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>{calcSummary.constructionFTEs.toLocaleString("en-AU")}</div>
                <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>Construction FTEs</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>{calcSummary.ongoingJobs.toLocaleString("en-AU")}</div>
                <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>Ongoing Jobs</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>{calcSummary.sustainabilityScore}/100</div>
                <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>Avg. Sustainability</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/projects"
            style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}
          >
            View Projects
          </Link>
          <button
            onClick={onStartNew}
            style={{ border: "1px solid var(--border-active)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}
          >
            Start New Import
          </button>
        </div>
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 3 }} className="overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
            onClick={() => setErrorsOpen((o) => !o)}
            style={{ background: "var(--slate)" }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{errors.length} row error{errors.length !== 1 ? "s" : ""}</span>
            <span style={{ color: "var(--text-ghost)", fontSize: 13 }}>{errorsOpen ? "▲" : "▼"}</span>
          </button>
          {errorsOpen && (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontSize: 11 }}>
                <thead style={{ background: "var(--slate)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th className="px-4 py-2 text-left" style={{ fontWeight: 500, color: "var(--text-ghost)" }}>Row</th>
                    <th className="px-4 py-2 text-left" style={{ fontWeight: 500, color: "var(--text-ghost)" }}>Field</th>
                    <th className="px-4 py-2 text-left" style={{ fontWeight: 500, color: "var(--text-ghost)" }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((e, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{e.row}</td>
                      <td className="px-4 py-2" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{e.field}</td>
                      <td className="px-4 py-2" style={{ color: "var(--text-ghost)" }}>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
