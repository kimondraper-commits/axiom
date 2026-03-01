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

export default async function AnalyticsPage() {
  const stats = await getCityStats();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", fontWeight: 600, fontSize: 22, letterSpacing: 1, color: "var(--text-primary)" }}>Analytics Dashboard</h1>
        <p style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 300, fontSize: 13, color: "var(--text-ghost)", marginTop: 4 }}>City-wide planning metrics and data</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Projects" value={stats.total} />
        <StatCard label="Active" value={stats.active} highlight />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="In Planning" value={stats.planning} />
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: "permits", label: "Building Permits", desc: "Monthly permit applications, approvals, and denials" },
          { id: "zoning", label: "Zoning Changes", desc: "Rezoning requests and council decisions over time" },
          { id: "population", label: "Population Trends", desc: "District-level demographic shifts and projections" },
          { id: "infrastructure", label: "Infrastructure Projects", desc: "Capital improvement program spending and status" },
        ].map((ds) => (
          <Link
            key={ds.id}
            href={`/analytics/${ds.id}`}
            style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 24 }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 500, color: "var(--text-primary)" }}>{ds.label}</h3>
              <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--gold-glow)", color: "var(--gold)", borderRadius: 9999, fontWeight: 500 }}>Live</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{ds.desc}</p>
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--gold)", fontWeight: 500 }}>View dashboard →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
