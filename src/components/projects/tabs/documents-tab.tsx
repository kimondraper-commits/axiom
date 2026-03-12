"use client";

import { useState } from "react";
import type { FullProject } from "../project-tabs";

const DOC_CATEGORIES = [
  "Planning Reports",
  "Traffic",
  "Environmental",
  "Architectural",
  "Survey",
  "Heritage",
  "Correspondence",
];

const FILE_TYPES = ["PDF", "DOCX", "DWG", "SHP", "XLSX", "JPG", "PNG", "Other"];

const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 400, fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 };

export function DocumentsTab({
  project,
  canEdit,
  onUpdate,
}: {
  project: FullProject;
  canEdit: boolean;
  onUpdate: (updates: Partial<FullProject>) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: DOC_CATEGORIES[0], fileType: "PDF", fileSize: "" });
  const [error, setError] = useState("");

  const filteredDocs = activeCategory === "All"
    ? project.documents
    : project.documents.filter((d) => d.category === activeCategory);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError("Name is required"); return; }
    setUploading(true);
    setError("");

    const res = await fetch(`/api/projects/${project.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        s3Key: `placeholder/${Date.now()}-${form.name}`,
        fileType: form.fileType,
        fileSize: form.fileSize ? parseInt(form.fileSize) : undefined,
        category: form.category,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      onUpdate({ documents: [{ ...data.data, uploadedBy: { name: "You" } }, ...project.documents] });
      setForm({ name: "", category: DOC_CATEGORIES[0], fileType: "PDF", fileSize: "" });
      setShowForm(false);
    } else {
      setError("Failed to add document.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...DOC_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              background: activeCategory === cat ? "var(--gold-glow)" : "var(--slate)",
              color: activeCategory === cat ? "var(--gold)" : "var(--text-ghost)",
              border: activeCategory === cat ? "1px solid var(--border-active)" : "1px solid transparent",
            }}
          >
            {cat}
            {cat !== "All" && (
              <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.6 }}>
                ({project.documents.filter((d) => d.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Documents list */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3 }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""}
          </span>
          {canEdit && (
            <button
              onClick={() => setShowForm((v) => !v)}
              style={{ fontSize: 13, color: "var(--gold)", fontWeight: 500 }}
            >
              {showForm ? "Cancel" : "+ Add Document"}
            </button>
          )}
        </div>

        {showForm && canEdit && (
          <form onSubmit={handleUpload} className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--slate)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label style={labelStyle}>Document Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full"
                  placeholder="e.g. Statement of Environmental Effects"
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full">
                  {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>File Type</label>
                <select value={form.fileType} onChange={(e) => setForm((f) => ({ ...f, fileType: e.target.value }))} className="w-full">
                  {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>File Size (bytes)</label>
                <input
                  type="number"
                  value={form.fileSize}
                  onChange={(e) => setForm((f) => ({ ...f, fileSize: e.target.value }))}
                  className="w-full"
                  placeholder="optional"
                />
              </div>
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: 11, marginBottom: 8 }}>{error}</p>}
            <button
              type="submit"
              disabled={uploading}
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, opacity: uploading ? 0.5 : 1 }}
            >
              {uploading ? "Adding…" : "Add Document"}
            </button>
          </form>
        )}

        <div>
          {filteredDocs.length === 0 ? (
            <p className="px-5 py-8 text-center" style={{ fontSize: 13, color: "var(--text-ghost)" }}>No documents in this category.</p>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }} className="truncate">{doc.name}</div>
                  <div className="flex gap-2 mt-0.5" style={{ fontSize: 11, color: "var(--text-ghost)" }}>
                    {doc.category && <span style={{ color: "var(--gold)" }}>{doc.category}</span>}
                    <span>{doc.fileType}</span>
                    {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>}
                    <span>Uploaded by {doc.uploadedBy.name ?? "Unknown"}</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString("en-AU")}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, background: "var(--slate)", color: "var(--text-ghost)", padding: "2px 8px", borderRadius: 4 }} className="shrink-0">
                  v{doc.version}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
