"use client";

import { useState } from "react";
import type { FullProject } from "../project-tabs";

type Milestone = FullProject["milestones"][number];

const STATUS_OPTIONS = ["upcoming", "in_progress", "completed", "overdue"] as const;

const STATUS_STYLES: Record<string, { dot: React.CSSProperties; label: React.CSSProperties }> = {
  upcoming:    { dot: { background: "var(--steel)", border: "2px solid var(--text-ghost)" }, label: { color: "var(--text-ghost)" } },
  in_progress: { dot: { background: "var(--gold)", border: "2px solid var(--gold-light)" }, label: { color: "var(--gold)" } },
  completed:   { dot: { background: "#22c55e", border: "2px solid #4ade80" }, label: { color: "#4ade80" } },
  overdue:     { dot: { background: "#ef4444", border: "2px solid #f87171" }, label: { color: "#f87171" } },
};

export function TimelineTab({
  project,
  canEdit,
  onUpdate,
}: {
  project: FullProject;
  canEdit: boolean;
  onUpdate: (updates: Partial<FullProject>) => void;
}) {
  const [milestones, setMilestones] = useState<Milestone[]>(project.milestones);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { dueDate: string; status: string; notes: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  function openEdit(m: Milestone) {
    setEditValues((prev) => ({
      ...prev,
      [m.id]: {
        dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split("T")[0] : "",
        status: m.milestoneStatus,
        notes: m.notes ?? "",
      },
    }));
    setExpanded(expanded === m.id ? null : m.id);
  }

  async function saveMilestone(m: Milestone) {
    const vals = editValues[m.id];
    if (!vals) return;
    setSaving(m.id);

    const body: Record<string, string | null> = {
      milestoneStatus: vals.status,
      notes: vals.notes || null,
      dueDate: vals.dueDate ? new Date(vals.dueDate).toISOString() : null,
    };

    const res = await fetch(`/api/projects/${project.id}/milestones/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      setMilestones((prev) => prev.map((ms) => ms.id === m.id ? { ...ms, ...data.data } : ms));
      setExpanded(null);
    }
    setSaving(null);
  }

  if (milestones.length === 0) {
    return (
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 32 }} className="text-center">
        <span style={{ fontSize: 13, color: "var(--text-ghost)" }}>No milestones found.</span>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3 }} className="overflow-hidden">
      <div className="relative">
        {milestones.map((m, idx) => {
          const styles = STATUS_STYLES[m.milestoneStatus] ?? STATUS_STYLES.upcoming;
          const isExpanded = expanded === m.id;
          const vals = editValues[m.id];

          return (
            <div key={m.id} className="relative flex gap-4 px-5 py-4">
              {/* Vertical line */}
              {idx < milestones.length - 1 && (
                <div className="absolute" style={{ left: "2.125rem", top: 32, bottom: 0, width: 2, background: "var(--border)" }} />
              )}

              {/* Status dot */}
              <div className="relative z-10 shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full" style={styles.dot} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{m.name}</span>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      <span style={{ fontSize: 11, fontWeight: 500, ...styles.label }}>
                        {m.milestoneStatus.replace("_", " ")}
                      </span>
                      {m.dueDate && (
                        <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>
                          Due: {new Date(m.dueDate).toLocaleDateString("en-AU")}
                        </span>
                      )}
                      {m.completedDate && (
                        <span style={{ fontSize: 11, color: "#4ade80" }}>
                          Completed: {new Date(m.completedDate).toLocaleDateString("en-AU")}
                        </span>
                      )}
                    </div>
                    {m.notes && !isExpanded && (
                      <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }} className="truncate max-w-sm">{m.notes}</p>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => openEdit(m)}
                      style={{ fontSize: 11, color: "var(--text-ghost)" }}
                      className="shrink-0"
                    >
                      {isExpanded ? "Close" : "Edit"}
                    </button>
                  )}
                </div>

                {isExpanded && vals && (
                  <div className="mt-3 space-y-2 p-3 rounded-md" style={{ background: "var(--slate)", border: "1px solid var(--border)" }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Status</label>
                        <select
                          value={vals.status}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, [m.id]: { ...prev[m.id], status: e.target.value } }))}
                          className="w-full"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Due Date</label>
                        <input
                          type="date"
                          value={vals.dueDate}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, [m.id]: { ...prev[m.id], dueDate: e.target.value } }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Notes</label>
                      <textarea
                        value={vals.notes}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, [m.id]: { ...prev[m.id], notes: e.target.value } }))}
                        className="w-full"
                        rows={2}
                        placeholder="Notes…"
                      />
                    </div>
                    <button
                      onClick={() => saveMilestone(m)}
                      disabled={saving === m.id}
                      style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "6px 12px", borderRadius: 4, fontSize: 11, fontWeight: 600, opacity: saving === m.id ? 0.5 : 1 }}
                    >
                      {saving === m.id ? "Saving…" : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
