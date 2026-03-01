"use client";

import { useState } from "react";
import type { FullProject } from "../project-tabs";

type Stakeholder = FullProject["stakeholders"][number];

const ROLES = [
  "Applicant",
  "Architect",
  "Traffic Engineer",
  "Environmental Consultant",
  "Council Officer",
  "Community Rep",
  "Other",
];

const EMPTY_FORM = { name: "", role: ROLES[0], email: "", phone: "", organisation: "" };

const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 400, fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 };

export function StakeholdersTab({
  project,
  canEdit,
  onUpdate,
}: {
  project: FullProject;
  canEdit: boolean;
  onUpdate: (updates: Partial<FullProject>) => void;
}) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(project.stakeholders);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  function setField(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/projects/${project.id}/stakeholders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      const updated = [...stakeholders, data.data];
      setStakeholders(updated);
      onUpdate({ stakeholders: updated });
      setForm(EMPTY_FORM);
    } else {
      setError("Failed to add stakeholder.");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/projects/${project.id}/stakeholders/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const updated = stakeholders.filter((s) => s.id !== id);
      setStakeholders(updated);
      onUpdate({ stakeholders: updated });
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      {/* Table */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3 }} className="overflow-hidden">
        {stakeholders.length === 0 ? (
          <div className="py-10 text-center" style={{ fontSize: 13, color: "var(--text-ghost)" }}>No stakeholders added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "var(--slate)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  {["Name", "Role", "Organisation", "Email", "Phone", ...(canEdit ? [""] : [])].map((h) => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-ghost)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stakeholders.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.role}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--text-ghost)" }}>{s.organisation ?? "—"}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--text-ghost)" }}>{s.email ?? "—"}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--text-ghost)" }}>{s.phone ?? "—"}</td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          style={{ fontSize: 11, color: "#ef4444", opacity: deleting === s.id ? 0.5 : 1 }}
                        >
                          {deleting === s.id ? "…" : "Delete"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add form */}
      {canEdit && (
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 16 }}>Add Stakeholder</h3>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              <div><label style={labelStyle}>Name *</label><input type="text" value={form.name} onChange={setField("name")} className="w-full" placeholder="Full name" /></div>
              <div><label style={labelStyle}>Role</label><select value={form.role} onChange={setField("role")} className="w-full">{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label style={labelStyle}>Organisation</label><input type="text" value={form.organisation} onChange={setField("organisation")} className="w-full" placeholder="Company / firm" /></div>
              <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={setField("email")} className="w-full" placeholder="email@example.com" /></div>
              <div><label style={labelStyle}>Phone</label><input type="tel" value={form.phone} onChange={setField("phone")} className="w-full" placeholder="+61 2 xxxx xxxx" /></div>
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: 11, marginBottom: 8 }}>{error}</p>}
            <button
              type="submit"
              disabled={saving}
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.5 : 1 }}
            >
              {saving ? "Adding…" : "Add Stakeholder"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
