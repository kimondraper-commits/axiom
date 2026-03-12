"use client";

import { useEffect, useState } from "react";

interface ImportRecord {
  id: string;
  filename: string;
  fileType: string;
  rowCount: number;
  projectsCreated: number;
  projectsUpdated: number;
  errorCount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  importedBy: { name: string | null; email: string };
}

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  COMPLETED:  { background: "rgba(34,197,94,0.12)",  color: "#4ade80" },
  FAILED:     { background: "rgba(239,68,68,0.12)",  color: "#f87171" },
  PROCESSING: { background: "rgba(200,164,78,0.12)", color: "#c8a44e" },
  PENDING:    { background: "var(--slate)",           color: "var(--text-ghost)" },
};

export function ImportHistory() {
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/import")
      .then((r) => r.json())
      .then((d) => setRecords(d.data ?? []))
      .catch(() => setError("Failed to load import history."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ fontSize: 13, color: "var(--text-ghost)", padding: "16px 0" }}>Loading history…</div>;
  if (error) return <div style={{ fontSize: 13, color: "#ef4444", padding: "16px 0" }}>{error}</div>;
  if (records.length === 0) return <div style={{ fontSize: 13, color: "var(--text-ghost)", padding: "16px 0" }}>No imports yet.</div>;

  return (
    <div className="overflow-x-auto" style={{ border: "1px solid var(--border)", borderRadius: 3 }}>
      <table className="w-full" style={{ fontSize: 13 }}>
        <thead style={{ background: "var(--slate)", borderBottom: "1px solid var(--border)" }}>
          <tr>
            {["Date", "Filename", "Type", "Rows", "Created", "Updated", "Errors", "By", "Status"].map((h) => (
              <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-ghost)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                {new Date(r.createdAt).toLocaleDateString("en-AU")}
              </td>
              <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "var(--text-primary)" }}>{r.filename}</td>
              <td className="px-4 py-3" style={{ color: "var(--text-ghost)", textTransform: "uppercase", fontSize: 11 }}>{r.fileType}</td>
              <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{r.rowCount}</td>
              <td className="px-4 py-3" style={{ color: "#4ade80", fontWeight: 500 }}>{r.projectsCreated}</td>
              <td className="px-4 py-3" style={{ color: "var(--gold)", fontWeight: 500 }}>{r.projectsUpdated}</td>
              <td className="px-4 py-3" style={{ color: r.errorCount > 0 ? "#f87171" : "var(--text-ghost)", fontWeight: r.errorCount > 0 ? 500 : 400 }}>{r.errorCount > 0 ? r.errorCount : "0"}</td>
              <td className="px-4 py-3 whitespace-nowrap truncate max-w-[140px]" style={{ color: "var(--text-ghost)" }}>
                {r.importedBy.name ?? r.importedBy.email}
              </td>
              <td className="px-4 py-3">
                <span style={{ ...(STATUS_STYLES[r.status] ?? { background: "var(--slate)", color: "var(--text-ghost)" }), padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
