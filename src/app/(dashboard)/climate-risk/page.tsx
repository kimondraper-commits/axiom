import { ClimateRiskPanel } from "@/components/climate-risk/climate-risk-panel";

export const metadata = { title: "Climate & Disaster Risk — AXIOM" };

export default function ClimateRiskPage() {
  return (
    <div className="p-8 space-y-6" style={{ animation: "fadeUp 0.5s ease both" }}>
      <div>
        <h1
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontWeight: 700,
            fontSize: 24,
            color: "var(--text-primary)",
          }}
        >
          Climate &amp; Disaster Risk
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Comprehensive natural hazard and climate risk assessment using NSW
          government spatial datasets.
        </p>
      </div>
      <ClimateRiskPanel />
    </div>
  );
}
