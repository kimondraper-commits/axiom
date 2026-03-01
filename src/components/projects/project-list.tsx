"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { differenceInDays } from "date-fns";

const NSW_STATUS_STYLES: Record<string, React.CSSProperties> = {
  "Pre-lodgement":      { background: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  "Under Assessment":   { background: "rgba(200,164,78,0.12)", color: "#c8a44e" },
  "On Exhibition":      { background: "rgba(168,85,247,0.12)", color: "#a855f7" },
  "Approved":           { background: "rgba(34,197,94,0.12)",  color: "#22c55e" },
  "Refused":            { background: "rgba(239,68,68,0.12)",  color: "#ef4444" },
  "Under Construction": { background: "rgba(249,115,22,0.12)", color: "#f97316" },
  "Completed":          { background: "rgba(16,185,129,0.12)", color: "#10b981" },
};

const NSW_STATUSES = [
  "Pre-lodgement",
  "Under Assessment",
  "On Exhibition",
  "Approved",
  "Refused",
  "Under Construction",
  "Completed",
];

const PROJECT_TYPES = [
  "Residential — Low Density",
  "Residential — Medium Density",
  "Residential — High Density",
  "Mixed-Use",
  "Commercial / Retail",
  "Industrial",
  "Community / Civic",
  "Infrastructure",
];

type Project = {
  id: string;
  title: string;
  address: string | null;
  lga: string | null;
  projectType: string | null;
  nswStatus: string | null;
  lodgementDate: string | Date | null;
  status: string;
};

type SortKey = "title" | "address" | "lga" | "projectType" | "nswStatus" | "lodgementDate" | "daysElapsed";

export function ProjectList({
  projects,
  canCreate,
}: {
  projects: Project[];
  canCreate: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("lodgementDate");
  const [sortAsc, setSortAsc] = useState(false);

  const now = new Date();

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  const filtered = useMemo(() => {
    let list = [...projects];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.address ?? "").toLowerCase().includes(q) ||
          (p.lga ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      list = list.filter((p) => p.nswStatus === statusFilter);
    }

    if (typeFilter !== "All") {
      list = list.filter((p) => p.projectType === typeFilter);
    }

    list.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      if (sortKey === "daysElapsed") {
        av = a.lodgementDate ? differenceInDays(now, new Date(a.lodgementDate)) : -1;
        bv = b.lodgementDate ? differenceInDays(now, new Date(b.lodgementDate)) : -1;
      } else if (sortKey === "lodgementDate") {
        av = a.lodgementDate ? new Date(a.lodgementDate).getTime() : 0;
        bv = b.lodgementDate ? new Date(b.lodgementDate).getTime() : 0;
      } else {
        av = (a[sortKey] ?? "") as string;
        bv = (b[sortKey] ?? "") as string;
      }

      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [projects, search, statusFilter, typeFilter, sortKey, sortAsc]);

  function ColHeader({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th
        onClick={() => handleSort(k)}
        className="px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap"
        style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-ghost)" }}
      >
        {label}
        <span style={{ marginLeft: 4, color: active ? "var(--gold)" : "var(--text-ghost)" }}>
          {active ? (sortAsc ? "↑" : "↓") : "↕"}
        </span>
      </th>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", fontWeight: 600, fontSize: 22, letterSpacing: 1, color: "var(--text-primary)" }}>Projects</h1>
          <p style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 300, fontSize: 13, color: "var(--text-ghost)", marginTop: 4 }}>{filtered.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2">
            <Link
              href="/import"
              style={{ border: "1px solid var(--border-active)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}
            >
              ↑ Import Projects
            </Link>
            <Link
              href="/projects/new"
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}
            >
              New Project
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, address or LGA…"
          className="flex-1 min-w-[200px]"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {NSW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3 }} className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ fontSize: 13, color: "var(--text-ghost)" }}>
            {projects.length === 0 ? "No projects found. Create your first project." : "No projects match the current filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "var(--slate)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  <ColHeader label="Name" k="title" />
                  <ColHeader label="Address" k="address" />
                  <ColHeader label="LGA" k="lga" />
                  <ColHeader label="Type" k="projectType" />
                  <ColHeader label="NSW Status" k="nswStatus" />
                  <ColHeader label="Lodgement Date" k="lodgementDate" />
                  <ColHeader label="Days Elapsed" k="daysElapsed" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const daysElapsed = p.lodgementDate
                    ? differenceInDays(now, new Date(p.lodgementDate))
                    : null;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-4 py-3">
                        <Link href={`/projects/${p.id}`} style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 13 }}>
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 180 }}><span className="truncate block">{p.address ?? "—"}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{p.lga ?? "—"}</td>
                      <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 140 }}><span className="truncate block">{p.projectType ?? "—"}</span></td>
                      <td className="px-4 py-3">
                        {p.nswStatus ? (
                          <span
                            style={{ ...NSW_STATUS_STYLES[p.nswStatus] ?? { background: "var(--slate)", color: "var(--text-ghost)" }, fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontWeight: 500 }}
                          >
                            {p.nswStatus}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {p.lodgementDate ? new Date(p.lodgementDate).toLocaleDateString("en-AU") : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {daysElapsed !== null ? `${daysElapsed}d` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
