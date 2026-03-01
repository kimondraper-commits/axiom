import { db } from "@/lib/db";
import { StatCard } from "@/components/analytics/stat-card";
import Link from "next/link";

export const metadata = { title: "Overview — AXIOM" };

async function getStats() {
  try {
    const [projectCount, activeProjects, totalDocuments, pendingComments] =
      await Promise.all([
        db.project.count(),
        db.project.count({ where: { status: "ACTIVE" } }),
        db.document.count(),
        db.comment.count({ where: { isPublic: true, isApproved: false } }),
      ]);
    return { projectCount, activeProjects, totalDocuments, pendingComments };
  } catch {
    return { projectCount: 0, activeProjects: 0, totalDocuments: 0, pendingComments: 0 };
  }
}

async function getRecentProjects() {
  try {
    return await db.project.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { members: true },
    });
  } catch {
    return [];
  }
}

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  PLANNING: { background: "rgba(200,164,78,0.12)", color: "var(--gold)" },
  ACTIVE: { background: "rgba(74,158,107,0.12)", color: "var(--status-success)" },
  ON_HOLD: { background: "rgba(200,164,78,0.1)", color: "var(--gold-dim)" },
  COMPLETED: { background: "rgba(74,158,107,0.15)", color: "var(--status-success)" },
  ARCHIVED: { background: "rgba(240,236,228,0.06)", color: "var(--text-ghost)" },
};

export default async function OverviewPage() {
  const [stats, recentProjects] = await Promise.all([
    getStats(),
    getRecentProjects(),
  ]);

  return (
    <>
      <style>{`
        .overview-quick-link {
          display: block;
          border-radius: 3px;
          padding: 16px;
          background: var(--carbon);
          border: 1px solid var(--border);
          transition: all 0.3s ease;
          text-decoration: none;
          cursor: pointer;
        }
        .overview-quick-link:hover {
          border-color: var(--border-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .overview-project-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          transition: background 0.15s ease;
          text-decoration: none;
        }
        .overview-project-row:hover {
          background: rgba(200, 164, 78, 0.03);
        }
      `}</style>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1
            style={{
              fontFamily: "var(--font-syne, 'Syne', sans-serif)",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: 1,
              color: "var(--text-primary)",
            }}
          >
            Welcome to AXIOM
          </h1>
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
              fontWeight: 300,
              fontSize: 13,
              color: "var(--text-ghost)",
            }}
          >
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { href: "/maps", label: "Open GIS Map", icon: "\uD83D\uDDFA\uFE0F", desc: "View zoning & parcels" },
            { href: "/analytics", label: "Analytics", icon: "\uD83D\uDCCA", desc: "City-wide dashboards" },
            { href: "/projects", label: "Projects", icon: "\uD83D\uDCC1", desc: "Manage planning projects" },
            { href: "/assistant", label: "AI Assistant", icon: "\uD83E\uDD16", desc: "Ask a planning question" },
            { href: "/calculators", label: "Calculators", icon: "\u2211", desc: "Population & impact tools" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="overview-quick-link">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div
                style={{
                  fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                {item.label}
              </div>
              <div
                className="mt-0.5"
                style={{ fontSize: 11, color: "var(--text-ghost)" }}
              >
                {item.desc}
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="rounded-lg" style={{ background: "var(--carbon)", border: "1px solid var(--border)" }}>
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h2 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 500, color: "var(--text-primary)" }}>Recent Projects</h2>
            <Link href="/projects" className="text-sm hover:underline" style={{ color: "var(--gold)" }}>
              View all
            </Link>
          </div>
          <div>
            {recentProjects.length === 0 ? (
              <p className="px-5 py-6 text-sm text-center" style={{ color: "var(--text-ghost)" }}>
                No projects yet.{" "}
                <Link href="/projects" className="hover:underline" style={{ color: "var(--gold)" }}>
                  Create one
                </Link>
              </p>
            ) : (
              recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="overview-project-row"
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{p.title}</div>
                    <div className="mt-0.5" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {p.city}{p.district ? ` \u00B7 ${p.district}` : ""} \u00B7 {p.members.length} member{p.members.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={STATUS_STYLES[p.status] ?? { background: "rgba(240,236,228,0.06)", color: "var(--text-ghost)" }}
                  >
                    {p.status.replace("_", " ")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
