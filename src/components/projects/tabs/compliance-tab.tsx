"use client";

import { useState, useEffect } from "react";
import type { FullProject } from "../project-tabs";

type ComplianceItem = FullProject["complianceItems"][number];

const COMPLIANCE_RESIDENTIAL = [
  "SEPP (Housing) 2021 check",
  "DCP setback requirements",
  "Height control compliance",
  "Minimum lot size",
  "Car parking rates",
  "Landscaping requirements",
  "Stormwater management plan",
  "Flood risk assessment",
  "Bushfire assessment",
  "Heritage impact statement",
  "Traffic impact assessment",
  "Acoustic assessment",
  "Contamination investigation",
  "Aboriginal heritage due diligence",
  "BASIX certificate",
  "Section 7.12 contributions",
];

const COMPLIANCE_MIXED = [
  "SEPP (Transport and Infrastructure)",
  "DCP compliance",
  "FSR compliance",
  "Height compliance",
  "Car parking (commercial rates)",
  "Loading/servicing",
  "Waste management",
  "Accessibility (BCA)",
  "Signage controls",
  "Contamination",
  "Aboriginal heritage",
  "s7.12 contributions",
];

const COMPLIANCE_GENERIC = [
  "Zoning compliance",
  "Height controls",
  "Setback requirements",
  "Parking requirements",
  "Landscaping requirements",
  "Stormwater management",
  "Environmental assessment",
  "Heritage assessment",
  "Traffic assessment",
  "s7.12 contributions",
];

function getSeedItems(projectType: string | null) {
  if (!projectType) return COMPLIANCE_GENERIC;
  if (projectType.startsWith("Residential")) return COMPLIANCE_RESIDENTIAL;
  if (projectType === "Mixed-Use" || projectType === "Commercial / Retail") return COMPLIANCE_MIXED;
  return COMPLIANCE_GENERIC;
}

function groupItems(items: ComplianceItem[]) {
  const sepp: ComplianceItem[] = [];
  const reports: ComplianceItem[] = [];
  const certs: ComplianceItem[] = [];
  const other: ComplianceItem[] = [];

  items.forEach((item) => {
    const l = item.label.toLowerCase();
    if (l.includes("sepp") || l.includes("dcp") || l.includes("fsr") || l.includes("height") || l.includes("setback") || l.includes("lot size") || l.includes("parking") || l.includes("zoning") || l.includes("loading") || l.includes("signage")) {
      sepp.push(item);
    } else if (l.includes("certificate") || l.includes("basix") || l.includes("s7.12") || l.includes("contributions")) {
      certs.push(item);
    } else if (l.includes("assessment") || l.includes("report") || l.includes("plan") || l.includes("statement") || l.includes("investigation") || l.includes("due diligence") || l.includes("management") || l.includes("waste") || l.includes("accessibility")) {
      reports.push(item);
    } else {
      other.push(item);
    }
  });

  return { "SEPP/DCP Controls": sepp, "Reports Required": reports, "Certificates": certs, ...(other.length ? { "Other": other } : {}) };
}

export function ComplianceTab({
  project,
  canEdit,
  onUpdate,
}: {
  project: FullProject;
  canEdit: boolean;
  onUpdate: (updates: Partial<FullProject>) => void;
}) {
  const [seeding, setSeeding] = useState(false);
  const [items, setItems] = useState<ComplianceItem[]>(project.complianceItems);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setItems(project.complianceItems);
  }, [project.complianceItems]);

  const total = items.length;
  const completed = items.filter((i) => i.checked).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function seed() {
    setSeeding(true);
    const labels = getSeedItems(project.projectType);
    const res = await fetch(`/api/projects/${project.id}/compliance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(labels.map((label, i) => ({ label, sortOrder: i }))),
    });
    if (res.ok) {
      const r2 = await fetch(`/api/projects/${project.id}/compliance`);
      const d2 = await r2.json();
      setItems(d2.data);
      onUpdate({ complianceItems: d2.data });
    }
    setSeeding(false);
  }

  async function toggleItem(item: ComplianceItem) {
    if (!canEdit) return;
    const newChecked = !item.checked;
    const res = await fetch(`/api/projects/${project.id}/compliance/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: newChecked }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, checked: newChecked } : i));
    }
  }

  async function saveNote(item: ComplianceItem) {
    const notes = noteValues[item.id] ?? item.notes ?? "";
    const res = await fetch(`/api/projects/${project.id}/compliance/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, notes } : i));
      setExpandedNotes((prev) => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  }

  function toggleNote(id: string, currentNote: string | null) {
    setNoteValues((prev) => ({ ...prev, [id]: prev[id] ?? currentNote ?? "" }));
    setExpandedNotes((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  if (total === 0) {
    return (
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 32 }} className="text-center">
        {seeding ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Generating checklist…</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--text-ghost)", marginBottom: 16 }}>No compliance items yet.</p>
            {canEdit && (
              <button
                onClick={seed}
                style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}
              >
                Generate Checklist
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  const groups = groupItems(items);

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 16 }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{completed} of {total} items complete</span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{pct}%</span>
        </div>
        <div style={{ width: "100%", background: "var(--slate)", borderRadius: 9999, height: 10 }}>
          <div
            style={{ background: "linear-gradient(90deg, var(--gold-dim), var(--gold))", height: 10, borderRadius: 9999, transition: "width 0.3s", width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([groupName, groupItems]) => (
        groupItems.length > 0 && (
          <div key={groupName} style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3 }} className="overflow-hidden">
            <div className="px-5 py-3" style={{ background: "var(--slate)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)" }}>{groupName}</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-ghost)" }}>({groupItems.filter((i) => i.checked).length}/{groupItems.length})</span>
            </div>
            <div>
              {groupItems.map((item) => (
                <div key={item.id} className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item)}
                      disabled={!canEdit}
                      className="mt-0.5 h-4 w-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: 13, color: item.checked ? "var(--text-ghost)" : "var(--text-primary)", textDecoration: item.checked ? "line-through" : "none" }}>
                        {item.label}
                      </span>
                      {item.notes && !expandedNotes.has(item.id) && (
                        <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }} className="truncate">{item.notes}</p>
                      )}
                      {expandedNotes.has(item.id) && (
                        <div className="mt-2">
                          <textarea
                            value={noteValues[item.id] ?? item.notes ?? ""}
                            onChange={(e) => setNoteValues((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            className="w-full"
                            rows={2}
                            placeholder="Add notes…"
                          />
                          <button
                            onClick={() => saveNote(item)}
                            style={{ marginTop: 4, fontSize: 11, color: "var(--gold)", fontWeight: 500 }}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => toggleNote(item.id, item.notes)}
                        style={{ fontSize: 11, color: "var(--text-ghost)" }}
                        className="shrink-0"
                      >
                        {expandedNotes.has(item.id) ? "✕" : "note"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
