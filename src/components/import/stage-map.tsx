"use client";

import type { FieldMapping, DestinationGroup } from "@/lib/import/types";
import { ALL_DESTINATION_FIELDS } from "@/lib/import/field-detection";

interface Props {
  mappings: FieldMapping[];
  importMode: "create" | "upsert";
  onMappingsChange: (mappings: FieldMapping[]) => void;
  onModeChange: (mode: "create" | "upsert") => void;
  onBeginImport: () => void;
  rowCount: number;
}

const BORDER_BY_CONFIDENCE: Record<string, string> = {
  HIGH: "rgba(34,197,94,0.4)",
  MEDIUM: "rgba(234,179,8,0.4)",
  LOW: "rgba(239,68,68,0.4)",
};

const CONFIDENCE_BADGE: Record<string, React.CSSProperties> = {
  HIGH:   { background: "rgba(34,197,94,0.12)", color: "#4ade80" },
  MEDIUM: { background: "rgba(234,179,8,0.12)",  color: "#eab308" },
  LOW:    { background: "rgba(239,68,68,0.12)",  color: "#f87171" },
};

const PROJECTS_CORE = ["title", "address", "city", "lga", "projectType", "nswStatus", "applicantName", "applicantEmail", "lodgementDate"];
const PROJECTS_PROPOSAL = ["dwellings", "siteAreaHa", "constructionCostM", "greenSpaceHa", "commercialGfa", "buildingHeight", "storeys", "carParking"];
const GIS_FIELDS = ["latitude", "longitude"];

export function StageMap({
  mappings,
  importMode,
  onMappingsChange,
  onModeChange,
  onBeginImport,
  rowCount,
}: Props) {
  function updateMapping(index: number, destinationField: string | null) {
    const updated = mappings.map((m, i) => {
      if (i !== index) return m;
      const found = ALL_DESTINATION_FIELDS.find((f) => f.field === destinationField);
      return {
        ...m,
        destinationField: destinationField,
        destinationGroup: (destinationField === null ? "Skip" : found?.group ?? "Projects") as DestinationGroup,
      };
    });
    onMappingsChange(updated);
  }

  const toProjects = mappings.filter((m) => m.destinationGroup === "Projects" && m.destinationField).length;
  const toGis = mappings.filter((m) => m.destinationGroup === "GIS Maps" && m.destinationField).length;
  const skipped = mappings.filter((m) => !m.destinationField || m.destinationGroup === "Skip").length;

  return (
    <div>
      <div className="overflow-x-auto mb-6" style={{ border: "1px solid var(--border)", borderRadius: 3 }}>
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead style={{ background: "var(--slate)", borderBottom: "1px solid var(--border)" }}>
            <tr>
              <th className="px-4 py-3 text-left" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>Your Data</th>
              <th className="px-4 py-3 text-left" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>Maps To</th>
              <th className="px-4 py-3 text-left" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, i) => {
              const borderColor = BORDER_BY_CONFIDENCE[m.confidence];
              return (
                <tr key={m.sourceColumn} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-3" style={{ borderLeft: `4px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{m.sourceColumn}</div>
                    <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>
                      {m.samples.filter(Boolean).slice(0, 3).join(", ") || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.destinationField ?? ""}
                      onChange={(e) => updateMapping(i, e.target.value || null)}
                      className="w-full"
                    >
                      <option value="">— Skip —</option>
                      <optgroup label="Projects — Core">
                        {PROJECTS_CORE.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Projects — Proposal">
                        {PROJECTS_PROPOSAL.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </optgroup>
                      <optgroup label="GIS Maps">
                        {GIS_FIELDS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </optgroup>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ ...CONFIDENCE_BADGE[m.confidence], padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
                      {m.confidence}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Import mode */}
      <div className="p-4 mb-5" style={{ background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 3 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 12 }}>Import Mode</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="importMode" value="create" checked={importMode === "create"} onChange={() => onModeChange("create")} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Create new projects for every row</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="importMode" value="upsert" checked={importMode === "upsert"} onChange={() => onModeChange("upsert")} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Update existing projects by title (create if not found)</span>
          </label>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-ghost)", marginBottom: 16 }}>
        {toProjects} column{toProjects !== 1 ? "s" : ""} mapped to Projects
        {toGis > 0 && `, ${toGis} to GIS Maps`}
        {skipped > 0 && `, ${skipped} skipped`}
        {" "}· {rowCount} row{rowCount !== 1 ? "s" : ""} to import
      </p>

      <button
        onClick={onBeginImport}
        style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}
      >
        Begin Import →
      </button>
    </div>
  );
}
