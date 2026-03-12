"use client";

import { useState } from "react";
import type { FullProject } from "../project-tabs";

type Submission = FullProject["submissions"][number];

const STATUS_CYCLE: Record<string, string> = {
  pending: "reviewed",
  reviewed: "addressed",
  addressed: "pending",
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  pending:   { background: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  reviewed:  { background: "rgba(200,164,78,0.12)", color: "#c8a44e" },
  addressed: { background: "rgba(34,197,94,0.12)",  color: "#22c55e" },
};

const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 400, fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 };

const EMPTY_FORM = { submitterName: "", keyIssues: "", supporting: false };

export function CommunityTab({
  project,
  canEdit,
  onUpdate,
}: {
  project: FullProject;
  canEdit: boolean;
  onUpdate: (updates: Partial<FullProject>) => void;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>(project.submissions);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [cycling, setCycling] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [responseValues, setResponseValues] = useState<Record<string, string>>({});

  const total = submissions.length;
  const supporting = submissions.filter((s) => s.supporting).length;
  const objecting = total - supporting;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/projects/${project.id}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submitterName: form.submitterName || undefined,
        keyIssues: form.keyIssues || undefined,
        supporting: form.supporting,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const updated = [data.data, ...submissions];
      setSubmissions(updated);
      onUpdate({ submissions: updated });
      setForm(EMPTY_FORM);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function cycleStatus(s: Submission) {
    setCycling(s.id);
    const newStatus = STATUS_CYCLE[s.status] ?? "pending";
    const res = await fetch(`/api/projects/${project.id}/submissions/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setSubmissions((prev) => prev.map((sub) => sub.id === s.id ? { ...sub, status: newStatus } : sub));
    }
    setCycling(null);
  }

  async function saveResponse(s: Submission) {
    const response = responseValues[s.id] ?? s.response ?? "";
    const res = await fetch(`/api/projects/${project.id}/submissions/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    if (res.ok) {
      setSubmissions((prev) => prev.map((sub) => sub.id === s.id ? { ...sub, response } : sub));
      setExpandedResponse(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 16 }} className="text-center">
          <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "var(--text-primary)" }}>{total}</div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>Total Submissions</div>
        </div>
        <div style={{ background: "var(--carbon)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 3, padding: 16 }} className="text-center">
          <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "#4ade80" }}>{supporting}</div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>Supporting</div>
        </div>
        <div style={{ background: "var(--carbon)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 3, padding: 16 }} className="text-center">
          <div style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 24, color: "#f87171" }}>{objecting}</div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>Objecting</div>
        </div>
      </div>

      {/* Submissions table */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3 }} className="overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Submissions</span>
          {canEdit && (
            <button
              onClick={() => setShowForm((v) => !v)}
              style={{ fontSize: 13, color: "var(--gold)", fontWeight: 500 }}
            >
              {showForm ? "Cancel" : "+ Add Submission"}
            </button>
          )}
        </div>

        {showForm && canEdit && (
          <form onSubmit={handleAdd} className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--slate)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label style={labelStyle}>Submitter Name</label>
                <input
                  type="text"
                  value={form.submitterName}
                  onChange={(e) => setForm((f) => ({ ...f, submitterName: e.target.value }))}
                  className="w-full"
                  placeholder="Anonymous if blank"
                />
              </div>
              <div>
                <label style={labelStyle}>Stance</label>
                <select
                  value={form.supporting ? "supporting" : "objecting"}
                  onChange={(e) => setForm((f) => ({ ...f, supporting: e.target.value === "supporting" }))}
                  className="w-full"
                >
                  <option value="objecting">Objecting</option>
                  <option value="supporting">Supporting</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label style={labelStyle}>Key Issues</label>
                <textarea
                  value={form.keyIssues}
                  onChange={(e) => setForm((f) => ({ ...f, keyIssues: e.target.value }))}
                  className="w-full"
                  rows={2}
                  placeholder="Summary of concerns or support…"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.5 : 1 }}
            >
              {saving ? "Adding…" : "Add Submission"}
            </button>
          </form>
        )}

        {submissions.length === 0 ? (
          <div className="py-10 text-center" style={{ fontSize: 13, color: "var(--text-ghost)" }}>No submissions recorded.</div>
        ) : (
          <div>
            {submissions.map((s, idx) => (
              <div key={s.id} className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-ghost)" }}>#{idx + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                        {s.submitterName ?? "Anonymous"}
                      </span>
                      <span style={{
                        fontSize: 11,
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontWeight: 500,
                        ...(s.supporting
                          ? { background: "rgba(34,197,94,0.12)", color: "#4ade80" }
                          : { background: "rgba(239,68,68,0.12)", color: "#f87171" }),
                      }}>
                        {s.supporting ? "Supporting" : "Objecting"}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>
                        {new Date(s.dateReceived).toLocaleDateString("en-AU")}
                      </span>
                    </div>
                    {s.keyIssues && (
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }} className="line-clamp-2">{s.keyIssues}</p>
                    )}
                    {s.response && expandedResponse !== s.id && (
                      <p style={{ fontSize: 11, color: "var(--gold)", marginTop: 4 }} className="truncate">Response: {s.response}</p>
                    )}
                    {expandedResponse === s.id && (
                      <div className="mt-2">
                        <textarea
                          value={responseValues[s.id] ?? s.response ?? ""}
                          onChange={(e) => setResponseValues((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-full"
                          rows={2}
                          placeholder="Council response…"
                        />
                        <button
                          onClick={() => saveResponse(s)}
                          style={{ marginTop: 4, fontSize: 11, color: "var(--gold)", fontWeight: 500 }}
                        >
                          Save Response
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => cycleStatus(s)}
                      disabled={!canEdit || cycling === s.id}
                      title="Click to advance status"
                      style={{
                        ...(STATUS_STYLES[s.status] ?? { background: "var(--slate)", color: "var(--text-ghost)" }),
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: "pointer",
                        opacity: (!canEdit || cycling === s.id) ? 0.5 : 1,
                      }}
                    >
                      {cycling === s.id ? "…" : s.status}
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setResponseValues((prev) => ({ ...prev, [s.id]: prev[s.id] ?? s.response ?? "" }));
                          setExpandedResponse(expandedResponse === s.id ? null : s.id);
                        }}
                        style={{ fontSize: 11, color: "var(--text-ghost)" }}
                      >
                        {expandedResponse === s.id ? "✕" : "respond"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
