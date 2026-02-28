import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CommentThread } from "@/components/projects/comment-thread";

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await db.project.findUnique({ where: { id: projectId } });
  return { title: project ? `${project.title} — City Pro` : "Project — City Pro" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      documents: { orderBy: { createdAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true } },
          replies: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!project) notFound();

  const canEdit = session?.user.role === "ADMIN" || session?.user.role === "PLANNER";

  const STATUS_COLORS: Record<string, string> = {
    PLANNING: "bg-slate-100 text-slate-700",
    ACTIVE: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/projects" className="text-sm text-slate-500 hover:text-blue-700 mb-1 block">
            ← Projects
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] ?? ""}`}>
              {project.status.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-500">
              {project.city}{project.district ? ` · ${project.district}` : ""} · Phase: {project.phase.replace("_", " ")}
            </span>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/assistant?projectId=${project.id}`}
            className="text-sm bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Ask AI Assistant
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h2 className="font-medium text-slate-900 mb-2">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-medium text-slate-900">Documents ({project.documents.length})</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {project.documents.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-400 text-center">No documents uploaded yet.</p>
              ) : (
                project.documents.map((doc) => (
                  <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{doc.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {doc.fileType} · Uploaded by {doc.uploadedBy.name} ·{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      v{doc.version}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comments */}
          <CommentThread
            projectId={project.id}
            comments={project.comments}
            currentUserId={session?.user.id}
            canModerate={canEdit}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-medium text-slate-900 mb-3">Project Details</h2>
            <dl className="space-y-2 text-sm">
              {[
                ["City", project.city],
                ["District", project.district ?? "—"],
                ["Phase", project.phase.replace("_", " ")],
                ["Budget", project.budget ? `$${project.budget.toLocaleString()}` : "—"],
                ["Start", project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"],
                ["End", project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"],
                ["Created", new Date(project.createdAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-slate-900 font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Team */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-medium text-slate-900 mb-3">Team ({project.members.length})</h2>
            <ul className="space-y-2">
              {project.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{m.user.name ?? m.user.email}</span>
                  <span className="text-xs text-slate-400">{m.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
