import { Suspense } from "react";
import { StatCard } from "@/components/analytics/stat-card";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Analytics — AXIOM" };

async function getCityStats() {
  const [total, active, completed, planning] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: "ACTIVE" } }),
    db.project.count({ where: { status: "COMPLETED" } }),
    db.project.count({ where: { status: "PLANNING" } }),
  ]);
  return { total, active, completed, planning };
}

const DATASETS = [
  {
    id: "permits",
    label: "Building Permits",
    desc: "Monthly permit applications, approvals, and denials",
    icon: "🏗️",
  },
  {
    id: "zoning",
    label: "Zoning Changes",
    desc: "Rezoning requests and council decisions over time",
    icon: "🗺️",
  },
  {
    id: "population",
    label: "Population Trends",
    desc: "District-level demographic shifts and projections",
    icon: "📈",
  },
  {
    id: "infrastructure",
    label: "Infrastructure Projects",
    desc: "Capital improvement program spending and status",
    icon: "⚙️",
  },
] as const;

export default async function AnalyticsPage() {
  const stats = await getCityStats();

  return (
    <>
      <style>{`
        .analytics-stat-grid > * {
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .analytics-stat-grid > *:nth-child(1) { animation-delay: 0ms; }
        .analytics-stat-grid > *:nth-child(2) { animation-delay: 70ms; }
        .analytics-stat-grid > *:nth-child(3) { animation-delay: 140ms; }
        .analytics-stat-grid > *:nth-child(4) { animation-delay: 210ms; }

        .dataset-card {
          display: block;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          box-shadow: var(--shadow-card);
          text-decoration: none;
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, border-color 0.22s ease;
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
          position: relative;
          overflow: hidden;
        }
        .dataset-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
          border-color: var(--border-hover);
        }
        .dataset-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--bronze));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          border-radius: 0 0 14px 14px;
        }
        .dataset-card:hover::after {
          transform: scaleX(1);
        }
        .dataset-card:nth-child(1) { animation-delay: 80ms; }
        .dataset-card:nth-child(2) { animation-delay: 140ms; }
        .dataset-card:nth-child(3) { animation-delay: 200ms; }
        .dataset-card:nth-child(4) { animation-delay: 260ms; }
        .dataset-arrow {
          transition: transform 0.2s ease;
        }
        .dataset-card:hover .dataset-arrow {
          transform: translateX(4px);
        }
      `}</style>

      <div className="p-8 max-w-6xl mx-auto">

        {/* ── Page header ── */}
        <div
          className="mb-8"
          style={{
            animation: "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h1
              style={{
                fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)",
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              Analytics Dashboard
            </h1>
            <div
              style={{
                height: 2,
                width: 32,
                background: "linear-gradient(90deg, var(--gold), var(--bronze))",
                borderRadius: 99,
                marginTop: 2,
              }}
            />
          </div>
          <p
            style={{
              fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
              fontWeight: 400,
              fontSize: 13,
              color: "var(--silver)",
              marginTop: 2,
            }}
          >
            City-wide planning metrics and data
          </p>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 analytics-stat-grid">
          <StatCard label="Total Projects" value={stats.total} index={0} />
          <StatCard label="Active" value={stats.active} index={1} highlight />
          <StatCard label="Completed" value={stats.completed} index={2} />
          <StatCard label="In Planning" value={stats.planning} index={3} />
        </div>

        {/* ── Dataset Cards ── */}
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 60ms both",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)",
              fontWeight: 600,
              fontSize: 16,
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            Live Datasets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DATASETS.map((ds) => (
            <Link key={ds.id} href={`/analytics/${ds.id}`} className="dataset-card">
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Icon badge */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(201,168,76,0.10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {ds.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--text-primary)",
                    }}
                  >
                    {ds.label}
                  </h3>
                </div>

                {/* Live badge */}
                <span
                  style={{
                    fontSize: 10,
                    padding: "3px 9px",
                    background: "rgba(5,150,105,0.10)",
                    color: "var(--green-dark)",
                    borderRadius: 9999,
                    fontWeight: 600,
                    fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                    letterSpacing: "0.05em",
                    border: "1px solid rgba(5,150,105,0.20)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--green-dark)",
                      display: "inline-block",
                    }}
                  />
                  LIVE
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 13,
                  color: "var(--silver-dark)",
                  fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                {ds.desc}
              </p>

              {/* CTA */}
              <div
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                  fontWeight: 600,
                  color: "var(--gold-dim)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                View dashboard{" "}
                <span className="dataset-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
