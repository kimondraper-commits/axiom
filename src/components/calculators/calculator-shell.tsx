"use client";

import { useState } from "react";
import { PopulationPanel } from "./population-panel";
import { EconomicPanel } from "./economic-panel";
import { EnvironmentalPanel } from "./environmental-panel";
import { SustainabilityPanel } from "./sustainability-panel";

const TABS = [
  { id: "population",    label: "Population" },
  { id: "economic",      label: "Economic" },
  { id: "environmental", label: "Environmental" },
  { id: "sustainability",label: "Sustainability" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CalculatorShell() {
  const [activeTab, setActiveTab] = useState<TabId>("population");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", fontWeight: 600, fontSize: 22, letterSpacing: 1, color: "var(--text-primary)" }}>
          Planning Calculators
        </h1>
        <p style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 300, fontSize: 13, color: "var(--text-ghost)", marginTop: 4 }}>
          Estimate population, economic impact, environmental metrics, and sustainability scores for
          development assessments and council reporting.
        </p>
      </div>

      {/* Tab row */}
      <div className="mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3 text-sm -mb-px transition-colors"
              style={{
                fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                fontWeight: activeTab === tab.id ? 500 : 400,
                fontSize: 13,
                color: activeTab === tab.id ? "var(--gold)" : "var(--text-ghost)",
                borderBottom: activeTab === tab.id ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 24 }}>
        {activeTab === "population"    && <PopulationPanel />}
        {activeTab === "economic"      && <EconomicPanel />}
        {activeTab === "environmental" && <EnvironmentalPanel />}
        {activeTab === "sustainability" && <SustainabilityPanel />}
      </div>

      {/* Footer note */}
      <p className="mt-4 text-center" style={{ fontSize: 11, color: "var(--text-ghost)" }}>
        Results are estimates only. All formulas reference Australian Bureau of Statistics (ABS),
        DCCEW, and NSW planning standards. Verify against project-specific data before submission.
      </p>
    </div>
  );
}
