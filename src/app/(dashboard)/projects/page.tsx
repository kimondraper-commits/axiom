import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectList } from "@/components/projects/project-list";

export const metadata = { title: "Projects — AXIOM" };

export default async function ProjectsPage() {
  const session = await auth();

  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      address: true,
      lga: true,
      projectType: true,
      nswStatus: true,
      lodgementDate: true,
      status: true,
    },
  });

  const canCreate =
    session?.user.role === "ADMIN" || session?.user.role === "PLANNER";

  return <ProjectList projects={projects} canCreate={canCreate} />;
}
