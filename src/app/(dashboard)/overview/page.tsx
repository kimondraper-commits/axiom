import { db } from "@/lib/db";
import { AnimatedStatCard } from "@/components/analytics/animated-stat-card";
import { SpotlightLink } from "@/components/ui/react-bits/spotlight-link";
import Link from "next/link";
import React from "react";

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
  PLANNING: { background: "rgba(201,168,76,0.12)", color: "#A8893C", border: "1px solid rgba(201,168,76,0.25)" },
  ACTIVE: { background: "rgba(5,150,105,0.10)", color: "#059669", border: "1px solid rgba(5,150,105,0.25)" },
  ON_HOLD: { background: "rgba(184,115,51,0.10)", color: "#B87333", border: "1px solid rgba(184,115,51,0.20)" },
  COMPLETED: { background: "rgba(52,211,153,0.12)", color: "#059669", border: "1px solid rgba(52,211,153,0.30)" },
  ARCHIVED: { background: "rgba(156,163,175,0.10)", color: "#9CA3AF", border: "1px solid rgba(156,163,175,0.20)" },
};

export default async function OverviewPage() {
  const [stats, recentProjects] = await Promise.all([getStats(), getRecentProjects()]);

  const date = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        .overview-project-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          transition: background 0.15s ease, transform 0.15s ease;
          text-decoration: none;
          border-bottom: 1px solid var(--border);
        }
        .overview-project-row:last-child {
          border-bottom: none;
        }
        .overview-project-row:hover {
          background: rgba(201, 168, 76, 0.04);
          padding-left: 28px;
        }
        .stat-grid > * {
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .stat-grid > *:nth-child(1) { animation-delay: 0ms; }
        .stat-grid > *:nth-child(2) { animation-delay: 70ms; }
        .stat-grid > *:nth-child(3) { animation-delay: 140ms; }
        .stat-grid > *:nth-child(4) { animation-delay: 210ms; }
        .link-grid > * {
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .link-grid > *:nth-child(1) { animation-delay: 60ms; }
        .link-grid > *:nth-child(2) { animation-delay: 110ms; }
        .link-grid > *:nth-child(3) { animation-delay: 160ms; }
        .link-grid > *:nth-child(4) { animation-delay: 210ms; }
        .link-grid > *:nth-child(5) { animation-delay: 260ms; }
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
              Welcome to AXIOM
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
            }}
          >
            {date}
          </p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stat-grid">
          <AnimatedStatCard label="Total Projects" value={stats.projectCount} index={0} />
          <AnimatedStatCard label="Active Projects" value={stats.activeProjects} index={1} highlight />
          <AnimatedStatCard label="Documents Filed" value={stats.totalDocuments} index={2} />
          <AnimatedStatCard label="Pending Comments" value={stats.pendingComments} index={3} alert={stats.pendingComments > 0} />
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10 link-grid">
          {[
            { href: "/maps", label: "Open GIS Map", icon: "🗺️", desc: "View zoning & parcels" },
            { href: "/analytics", label: "Analytics", icon: "📊", desc: "City-wide dashboards" },
            { href: "/projects", label: "Projects", icon: "📁", desc: "Manage planning projects" },
            { href: "/assistant", label: "AI Assistant", icon: "🤖", desc: "Ask a planning question" },
            { href: "/calculators", label: "Calculators", icon: "∑", desc: "Population & impact tools" },
          ].map((item) => (
            <SpotlightLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              desc={item.desc}
            />
          ))}
        </div>

        {/* ── Recent Projects ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 14,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
            animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 320ms both",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(250,251,252,0.7)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)",
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Recent Projects
            </h2>
            <Link
              href="/projects"
              style={{
                fontSize: 12,
                fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                fontWeight: 500,
                color: "var(--gold-dim)",
                textDecoration: "none",
              }}
            >
              View all →
            </Link>
          </div>

          {/* Rows */}
          <div>
            {recentProjects.length === 0 ? (
              <p
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "var(--silver)",
                  fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                }}
              >
                No projects yet.{" "}
                <Link href="/projects" style={{ color: "var(--gold)", fontWeight: 500 }}>
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
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                        marginBottom: 2,
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--silver)",
                        fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {p.city}
                      {p.district ? ` · ${p.district}` : ""} · {p.members.length} member
                      {p.members.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                      fontSize: 11,
                      fontWeight: 600,
                      ...(STATUS_STYLES[p.status] ?? STATUS_STYLES.ARCHIVED),
                    }}
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
