import { Suspense } from "react";
import { StatCard } from "@/components/analytics/stat-card";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Analytics — City Pro" };

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
        <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">City-wide planning metrics and data</p>
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
            className="bg-white border border-slate-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-slate-900">{ds.label}</h3>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">Live</span>
            </div>
            <p className="text-sm text-slate-500">{ds.desc}</p>
            <div className="mt-4 text-xs text-blue-700 font-medium">View dashboard →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
