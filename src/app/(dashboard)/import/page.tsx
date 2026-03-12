import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportWizard } from "@/components/import/import-wizard";
import { ImportHistory } from "@/components/import/import-history";

export const metadata = { title: "Import Data — AXIOM" };

export default async function ImportPage() {
  const session = await auth();

  if (!session || session.user.role === "VIEWER") {
    redirect("/projects");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 style={{ fontFamily: "var(--font-syne, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 22, letterSpacing: 1, color: "var(--text-primary)" }}>Import Data</h1>
        <p style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 300, fontSize: 13, color: "var(--text-ghost)", marginTop: 4 }}>
          Bulk-load projects from CSV, Excel or GeoJSON files in 4 steps.
        </p>
      </div>

      <ImportWizard />

      <div className="mt-8">
        <h2 style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 16 }}>Import History</h2>
        <ImportHistory />
      </div>
    </div>
  );
}
