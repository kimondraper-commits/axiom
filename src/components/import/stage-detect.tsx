"use client";

import { useState } from "react";
import type { FieldMapping, ParsedFile } from "@/lib/import/types";
import { detectProjectCount } from "@/lib/import/field-detection";

interface Props {
  mappings: FieldMapping[];
  parsedFile: ParsedFile;
}

const CONFIDENCE_STYLES = {
  HIGH:   { badge: { background: "rgba(34,197,94,0.12)", color: "#4ade80" },   border: "rgba(34,197,94,0.4)" },
  MEDIUM: { badge: { background: "rgba(234,179,8,0.12)",  color: "#eab308" },  border: "rgba(234,179,8,0.4)" },
  LOW:    { badge: { background: "rgba(239,68,68,0.12)",  color: "#f87171" },  border: "rgba(239,68,68,0.4)" },
};

export function StageDetect({ mappings, parsedFile }: Props) {
  const [openSection, setOpenSection] = useState<string | null>("HIGH");

  const high = mappings.filter((m) => m.confidence === "HIGH" && m.destinationField);
  const medium = mappings.filter((m) => m.confidence === "MEDIUM" && m.destinationField);
  const lowAndUnmatched = mappings.filter((m) => m.confidence === "LOW" || !m.destinationField);
  const unmatched = mappings.filter((m) => !m.destinationField).length;

  const { count, mode } = detectProjectCount(parsedFile.rows, mappings);
  const hasTitle = mappings.some((m) => m.destinationField === "title");

  function toggle(section: string) {
    setOpenSection((s) => (s === section ? null : section));
  }

  function MappingRow({ m }: { m: FieldMapping }) {
    const style = CONFIDENCE_STYLES[m.confidence];
    return (
      <div className="flex items-center gap-4 px-4 py-3 rounded-md mb-2" style={{ background: "var(--slate)", borderLeft: `4px solid ${style.border}` }}>
        <div className="flex-1 min-w-0">
          <span style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 13 }}>{m.sourceColumn}</span>
          <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }} className="truncate">
            {m.samples.filter(Boolean).slice(0, 3).join(" · ") || "—"}
          </div>
        </div>
        <span style={{ color: "var(--text-ghost)", fontSize: 13 }}>→</span>
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {m.destinationField ?? <span style={{ color: "var(--text-ghost)", fontStyle: "italic" }}>Skip</span>}
          </span>
          {m.destinationField && (
            <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>{m.destinationGroup}</div>
          )}
        </div>
        <span style={{ ...style.badge, padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
          {m.confidence}
        </span>
      </div>
    );
  }

  function Section({
    title,
    items,
    id,
    emptyText,
  }: {
    title: string;
    items: FieldMapping[];
    id: string;
    emptyText: string;
  }) {
    const isOpen = openSection === id;
    return (
      <div style={{ border: "1px solid var(--border)", borderRadius: 3 }} className="overflow-hidden mb-3">
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
          onClick={() => toggle(id)}
          style={{ background: "var(--slate)" }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{title}</span>
          <div className="flex items-center gap-2">
            <span style={{ padding: "2px 8px", background: "var(--graphite)", color: "var(--text-ghost)", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
              {items.length}
            </span>
            <span style={{ color: "var(--text-ghost)", fontSize: 13 }}>{isOpen ? "▲" : "▼"}</span>
          </div>
        </button>
        {isOpen && (
          <div className="p-4">
            {items.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-ghost)", fontStyle: "italic" }}>{emptyText}</p>
            ) : (
              items.map((m) => <MappingRow key={m.sourceColumn} m={m} />)
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Summary banner */}
      <div className="flex flex-wrap gap-4 mb-5 px-4 py-3" style={{ background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 3, fontSize: 13 }}>
        <span style={{ color: "var(--text-secondary)" }}>{mappings.length} columns</span>
        <span style={{ color: "#4ade80", fontWeight: 500 }}>HIGH: {high.length}</span>
        <span style={{ color: "#eab308", fontWeight: 500 }}>MEDIUM: {medium.length}</span>
        <span style={{ color: "#f87171", fontWeight: 500 }}>LOW: {lowAndUnmatched.length - unmatched}</span>
        <span style={{ color: "var(--text-ghost)" }}>Unmatched: {unmatched}</span>
      </div>

      {mode === "multi" && (
        <div className="mb-4 px-4 py-3" style={{ background: "var(--gold-glow)", border: "1px solid var(--border-active)", color: "var(--gold)", fontSize: 13, borderRadius: 3 }}>
          {count} projects detected in this file. Each row will be imported as a separate project.
        </div>
      )}
      {!hasTitle && (
        <div className="mb-4 px-4 py-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: 13, borderRadius: 3 }}>
          Warning: No &quot;title&quot; column detected. Title is required — please map it manually in the next step.
        </div>
      )}

      <Section id="HIGH" title="High Confidence Matches" items={high} emptyText="No high confidence matches found." />
      <Section id="MEDIUM" title="Medium Confidence Matches" items={medium} emptyText="No medium confidence matches found." />
      <Section id="LOW" title="Low Confidence & Unmatched" items={lowAndUnmatched} emptyText="No low confidence or unmatched columns." />
    </div>
  );
}
