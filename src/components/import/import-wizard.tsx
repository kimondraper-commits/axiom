"use client";

import { useState } from "react";
import { StageUpload } from "./stage-upload";
import { StageDetect } from "./stage-detect";
import { StageMap } from "./stage-map";
import { StageDistribute } from "./stage-distribute";
import { detectFields } from "@/lib/import/field-detection";
import type { ParsedFile, ColumnSample, FieldMapping, ImportResult } from "@/lib/import/types";

type Stage = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: "Upload" },
  { n: 2, label: "Detect" },
  { n: 3, label: "Map" },
  { n: 4, label: "Distribute" },
];

export function ImportWizard() {
  const [stage, setStage] = useState<Stage>(1);
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [columnSamples, setColumnSamples] = useState<ColumnSample[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importMode, setImportMode] = useState<"create" | "upsert">("create");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function handleParsed(parsed: ParsedFile, samples: ColumnSample[]) {
    setParsedFile(parsed);
    setColumnSamples(samples);
  }

  function goToDetect() {
    if (!parsedFile || columnSamples.length === 0) return;
    const detections = detectFields(columnSamples);
    setFieldMappings(detections);
    setStage(2);
  }

  async function beginImport() {
    if (!parsedFile) return;
    setLoading(true);
    setApiError(null);
    setStage(4);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: parsedFile.rows,
          fieldMappings,
          fileName: parsedFile.fileName,
          fileType: parsedFile.fileType,
          mode: importMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error?.message ?? "Import failed.");
      } else {
        setImportResult(data.data);
      }
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setParsedFile(null);
    setColumnSamples([]);
    setFieldMappings([]);
    setImportResult(null);
    setApiError(null);
    setImportMode("create");
    setStage(1);
  }

  return (
    <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 24, marginBottom: 32 }}>
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((step, i) => {
          const isActive = stage === step.n;
          const isComplete = stage > step.n;
          return (
            <div key={step.n} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)" }
                      : isComplete
                      ? { background: "#22c55e", color: "white" }
                      : { background: "var(--slate)", color: "var(--text-ghost)" }
                  }
                >
                  {isComplete ? "✓" : step.n}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isActive ? "var(--gold)" : isComplete ? "#4ade80" : "var(--text-ghost)",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-12 h-px mx-3" style={{ background: isComplete ? "#4ade80" : "var(--border)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage content */}
      {stage === 1 && (
        <>
          <StageUpload onParsed={handleParsed} />
          <div className="mt-6 flex justify-end">
            <button
              onClick={goToDetect}
              disabled={!parsedFile}
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, opacity: !parsedFile ? 0.4 : 1 }}
            >
              Detect Fields →
            </button>
          </div>
        </>
      )}

      {stage === 2 && parsedFile && (
        <>
          <StageDetect mappings={fieldMappings} parsedFile={parsedFile} />
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStage(1)}
              style={{ border: "1px solid var(--border-active)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStage(3)}
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}
            >
              Review Mapping →
            </button>
          </div>
        </>
      )}

      {stage === 3 && parsedFile && (
        <StageMap
          mappings={fieldMappings}
          importMode={importMode}
          onMappingsChange={setFieldMappings}
          onModeChange={setImportMode}
          onBeginImport={beginImport}
          rowCount={parsedFile.rowCount}
        />
      )}

      {stage === 4 && (
        <StageDistribute
          result={importResult}
          loading={loading}
          apiError={apiError}
          rowCount={parsedFile?.rowCount ?? 0}
          onStartNew={startNew}
        />
      )}
    </div>
  );
}
