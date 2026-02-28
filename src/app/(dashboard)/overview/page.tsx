import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatCard } from "@/components/analytics/stat-card";
import Link from "next/link";

export const metadata = { title: "Overview — City Pro" };

async function getStats() {
  const [projectCount, activeProjects, totalDocuments, pendingComments] =
    await Promise.all([
      db.project.count(),
      db.project.count({ where: { status: "ACTIVE" } }),
      db.document.count(),
      db.comment.count({ where: { isPublic: true, isApproved: false } }),
    ]);
  return { projectCount, activeProjects, totalDocuments, pendingComments };
}

async function getRecentProjects() {
  return db.project.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { members: true },
  });
}

export default async function OverviewPage() {
  const session = await auth();
  const [stats, recentProjects] = await Promise.all([
    getStats(),
    getRecentProjects(),
  ]);

  const statusColors: Record<string, string> = {
    PLANNING: "bg-slate-100 text-slate-700",
    ACTIVE: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {session?.user.name?.split(" ")[0] ?? "Planner"}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Projects" value={stats.projectCount} />
        <StatCard label="Active Projects" value={stats.activeProjects} highlight />
        <StatCard label="Documents Filed" value={stats.totalDocuments} />
        <StatCard
          label="Pending Comments"
          value={stats.pendingComments}
          alert={stats.pendingComments > 0}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { href: "/maps", label: "Open GIS Map", icon: "🗺️", desc: "View zoning & parcels" },
          { href: "/analytics", label: "Analytics", icon: "📊", desc: "City-wide dashboards" },
          { href: "/projects", label: "Projects", icon: "📁", desc: "Manage planning projects" },
          { href: "/assistant", label: "AI Assistant", icon: "🤖", desc: "Ask a planning question" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-medium text-slate-900 text-sm">{item.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-medium text-slate-900">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-blue-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentProjects.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400 text-center">
              No projects yet.{" "}
              <Link href="/projects" className="text-blue-700 hover:underline">
                Create one
              </Link>
            </p>
          ) : (
            recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{p.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {p.city}{p.district ? ` · ${p.district}` : ""} · {p.members.length} member{p.members.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {p.status.replace("_", " ")}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
