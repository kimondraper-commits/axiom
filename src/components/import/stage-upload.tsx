"use client";

import { useRef, useState } from "react";
import { parseCSV, parseXLSX, parseGeoJSON, parsePaste, getColumnSamples } from "@/lib/import/parsers";
import type { ParsedFile, ColumnSample } from "@/lib/import/types";

interface Props {
  onParsed: (parsed: ParsedFile, samples: ColumnSample[]) => void;
}

type Tab = "upload" | "paste" | "templates";

export function StageUpload({ onParsed }: Props) {
  const [tab, setTab] = useState<Tab>("upload");
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setParsed(null);
    try {
      let result: ParsedFile;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "csv") result = await parseCSV(file);
      else if (ext === "xlsx" || ext === "xls") result = await parseXLSX(file);
      else if (ext === "geojson" || ext === "json") result = await parseGeoJSON(file);
      else throw new Error("Unsupported file type. Please upload CSV, Excel, or GeoJSON.");

      const samples = getColumnSamples(result);
      setParsed(result);
      onParsed(result, samples);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse file.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handlePaste() {
    setError(null);
    try {
      const result = parsePaste(pasteText);
      const samples = getColumnSamples(result);
      setParsed(result);
      onParsed(result, samples);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse pasted data.");
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["upload", "paste", "templates"] as Tab[]).map((t) => (
          <button
            key={t}
            className="px-4 py-2 -mb-px transition-colors"
            onClick={() => setTab(t)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: tab === t ? "var(--gold)" : "var(--text-ghost)",
              borderBottom: tab === t ? "2px solid var(--gold)" : "2px solid transparent",
            }}
          >
            {t === "upload" ? "File Upload" : t === "paste" ? "Paste Data" : "Templates"}
          </button>
        ))}
      </div>

      {tab === "upload" && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg p-12 text-center cursor-pointer transition-colors"
            style={{
              border: `2px dashed ${dragging ? "var(--gold)" : "var(--border-active)"}`,
              background: dragging ? "var(--gold-glow)" : "transparent",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 12, color: "var(--gold)" }}>↑</div>
            <p style={{ fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 }}>Drop your file here or click to browse</p>
            <p style={{ fontSize: 13, color: "var(--text-ghost)" }}>Supports CSV, Excel (.xlsx), GeoJSON up to 50 MB</p>
            <div className="flex gap-2 justify-center mt-3">
              {["CSV", "Excel", "GeoJSON"].map((t) => (
                <span key={t} style={{ padding: "2px 8px", background: "var(--slate)", color: "var(--text-ghost)", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{t}</span>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.geojson,.json"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}

      {tab === "paste" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Paste comma-separated or tab-separated data. First row must be headers.</p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full"
            style={{ height: 192, fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)" }}
            placeholder="title,address,lga,dwellings&#10;My Project,123 Smith St,Sydney,50"
          />
          <button
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            style={{ marginTop: 12, background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, opacity: !pasteText.trim() ? 0.5 : 1 }}
          >
            Parse Data
          </button>
        </div>
      )}

      {tab === "templates" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>Download a template to see the expected format, then fill in your data.</p>
          <div className="space-y-3">
            {[
              { href: "/templates/projects-template.csv", name: "NSW Projects Template", desc: "All project fields with 3 example rows" },
              { href: "/templates/mixed-use-template.csv", name: "Mixed-Use Projects Template", desc: "Mixed-use development examples" },
              { href: "/templates/geojson-template.json", name: "GeoJSON Template", desc: "GeoJSON format with NSW coordinates" },
            ].map((t) => (
              <a
                key={t.href}
                href={t.href}
                download
                className="flex items-center gap-3 p-4 rounded-lg transition-colors"
                style={{ border: "1px solid var(--border)", background: "var(--slate)" }}
              >
                <span style={{ fontSize: 20, color: "var(--gold)" }}>↓</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>{t.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, padding: "12px 16px", borderRadius: 6 }}>{error}</div>
      )}

      {parsed && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <span style={{ padding: "2px 10px", background: "rgba(34,197,94,0.12)", color: "#4ade80", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
              {parsed.rowCount} rows
            </span>
            <span style={{ padding: "2px 10px", background: "var(--slate)", color: "var(--text-ghost)", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
              {parsed.headers.length} columns
            </span>
            <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>{parsed.fileName}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {parsed.headers.map((h) => (
              <span key={h} style={{ padding: "2px 8px", background: "var(--gold-glow)", color: "var(--gold)", borderRadius: 4, fontSize: 11, fontWeight: 500, border: "1px solid var(--border-active)" }}>
                {h}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto" style={{ border: "1px solid var(--border)", borderRadius: 3 }}>
            <table style={{ fontSize: 11 }} className="w-full">
              <thead style={{ background: "var(--slate)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  {parsed.headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left whitespace-nowrap" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 10).map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    {parsed.headers.map((h) => (
                      <td key={h} className="px-3 py-2 max-w-[150px] truncate whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {row[h] != null ? String(row[h]) : <span style={{ color: "var(--text-ghost)" }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.rowCount > 10 && (
              <div className="px-3 py-2 text-center" style={{ fontSize: 11, color: "var(--text-ghost)", borderTop: "1px solid var(--border)" }}>
                Showing first 10 of {parsed.rowCount} rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
