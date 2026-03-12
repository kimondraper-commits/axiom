"use client";

import { useState, useMemo, useEffect } from "react";
import { FTE_PER_MILLION, RESIDENTIAL_FTE, COMMERCIAL_DENSITY_M2, RETAIL_SPEND_PER_PERSON, AVG_SALARY } from "@/lib/reference-data";

function ResultCard({ label, value, unit, note, badge }: { label: string; value: string; unit: string; note: string; badge?: string }) {
  return (
    <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
      <div className="flex items-center gap-2">
        <p style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>{label}</p>
        {badge && (
          <span
            style={{
              fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              fontSize: 9,
              letterSpacing: 1,
              color: "var(--status-success)",
              background: "rgba(5, 150, 105, 0.1)",
              border: "1px solid rgba(5, 150, 105, 0.3)",
              borderRadius: 4,
              padding: "1px 6px",
              marginBottom: 4,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <p style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)" }}>
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

interface RbaData {
  cpiAnnualChangePct: number | null;
  latestCpiIndex: number | null;
  latestCpiDate: string | null;
}

export function EconomicPanel() {
  const [projectCostM, setProjectCostM] = useState(50);
  const [dwellings, setDwellings] = useState(500);
  const [commercialGfa, setCommercialGfa] = useState(2000);
  const [estimatedPop, setEstimatedPop] = useState(1265);
  const [landValueM, setLandValueM] = useState(10);
  const [ratePct, setRatePct] = useState(0.8);

  const [rbaData, setRbaData] = useState<RbaData | null>(null);
  const [rbaLoading, setRbaLoading] = useState(false);
  const [rbaError, setRbaError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRbaLoading(true);
    fetch("/api/data-sources/rba")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setRbaData(json.data);
          setRbaError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRbaError(err instanceof Error ? err.message : "Failed to fetch");
        }
      })
      .finally(() => {
        if (!cancelled) setRbaLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const escalationRate = rbaData?.cpiAnnualChangePct ?? null;

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

  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 };
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
          <p style={helperStyle}>Typical range 0.5-1.2%</p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {/* RBA Live Data */}
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 14,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <p
              style={{
                fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--gold-dim)",
              }}
            >
              RBA Economic Indicators
            </p>
            {rbaData && (
              <span
                style={{
                  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                  fontSize: 9,
                  color: "var(--status-success)",
                  background: "rgba(5, 150, 105, 0.1)",
                  border: "1px solid rgba(5, 150, 105, 0.3)",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                LIVE DATA
              </span>
            )}
          </div>
          {rbaLoading && (
            <p style={{ fontSize: 12, color: "var(--text-ghost)" }}>Loading RBA data...</p>
          )}
          {rbaError && (
            <p style={{ fontSize: 12, color: "var(--status-error)" }}>
              {rbaError} — using static defaults
            </p>
          )}
          {rbaData && (
            <div className="flex gap-6">
              <div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Cost Escalation Rate (CPI)</p>
                <p
                  style={{
                    fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
                    fontWeight: 600,
                    fontSize: 20,
                    color: "var(--text-primary)",
                  }}
                >
                  {escalationRate !== null ? `${escalationRate}%` : "N/A"}
                  <span style={{ fontSize: 12, color: "var(--text-ghost)", fontWeight: 400, marginLeft: 6 }}>
                    p.a.
                  </span>
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>CPI Index</p>
                <p
                  style={{
                    fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
                    fontWeight: 600,
                    fontSize: 20,
                    color: "var(--text-primary)",
                  }}
                >
                  {rbaData.latestCpiIndex ?? "N/A"}
                </p>
              </div>
            </div>
          )}
          <p style={{ fontSize: 10, color: "var(--text-ghost)", marginTop: 6 }}>
            Economic data: Reserve Bank of Australia (rba.gov.au)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Construction FTEs" value={fmt(results.constructionFtes)} unit="FTE" note="project_cost_M x 9 (ABS ~9 FTE per $1M construction)" />
          <ResultCard label="Ongoing residential jobs" value={fmt(results.ongoingResidential, 1)} unit="FTE" note="dwellings x 0.35 local employment multiplier" />
          <ResultCard label="Ongoing commercial jobs" value={fmt(results.ongoingCommercial, 1)} unit="FTE" note="commercial_gfa / 25 m² per employee" />
          <ResultCard label="Total jobs generated" value={fmt(results.totalJobs, 1)} unit="FTE" note="Construction + ongoing residential + commercial" />
          <ResultCard label="Annual retail spending" value={fmtDollar(results.retailSpending)} unit="/yr" note="pop x $18,000/person/yr (ABS household spending avg)" />
          <ResultCard label="Annual council rates" value={fmtDollar(results.annualRates)} unit="/yr" note={`land_value x ${ratePct}% council rate`} />
          <div className="col-span-2">
            <ResultCard label="10-year economic contribution" value={fmtDollar(results.tenYrContribution)} unit="(GVA basis)" note="project_cost + (total_jobs x $95k avg salary x 10 yr)" />
          </div>
        </div>
      </div>
    </div>
  );
}
