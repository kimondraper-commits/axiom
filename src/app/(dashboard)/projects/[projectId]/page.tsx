import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectTabs } from "@/components/projects/project-tabs";

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await db.project.findUnique({ where: { id: projectId } });
  return { title: project ? `${project.title} — AXIOM` : "Project — AXIOM" };
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
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
      complianceItems: { orderBy: { sortOrder: "asc" } },
      milestones: { orderBy: { sortOrder: "asc" } },
      stakeholders: { orderBy: { createdAt: "asc" } },
      submissions: { orderBy: { dateReceived: "desc" } },
    },
  });

  if (!project) notFound();

  const canEdit = session?.user.role === "ADMIN" || session?.user.role === "PLANNER";

  return <ProjectTabs project={project} canEdit={canEdit} />;
}
