import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Projects — City Pro" };

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

export default async function ProjectsPage() {
  const session = await auth();

  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      members: { include: { user: { select: { name: true, image: true } } } },
      _count: { select: { documents: true, comments: true } },
    },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1 text-sm">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {(session?.user.role === "ADMIN" || session?.user.role === "PLANNER") && (
          <Link
            href="/projects/new"
            className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            New Project
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 text-center">
            <p className="text-slate-400 text-sm">No projects found.</p>
          </div>
        ) : (
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-medium text-slate-900 truncate">{p.title}</h2>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] ?? ""}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {p.city}{p.district ? ` · ${p.district}` : ""} · {p.phase.replace("_", " ")}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400 space-y-1">
                  <div>{p._count.documents} doc{p._count.documents !== 1 ? "s" : ""}</div>
                  <div>{p._count.comments} comment{p._count.comments !== 1 ? "s" : ""}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
