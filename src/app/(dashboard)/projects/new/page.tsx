import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "@/components/projects/create-project-form";

export const metadata = { title: "New Project — AXIOM" };

export default async function NewProjectPage() {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    redirect("/projects");
  }

  return <CreateProjectForm />;
}
