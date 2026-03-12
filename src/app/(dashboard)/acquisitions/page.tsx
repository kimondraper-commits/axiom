import { AcquisitionPanel } from "@/components/acquisitions/acquisition-panel";

export const metadata = { title: "Property Acquisitions — AXIOM" };

export default function AcquisitionsPage() {
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
          Property Acquisition Analyser
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Assess property impact and acquisition costs for proposed
          infrastructure corridors.
        </p>
      </div>
      <AcquisitionPanel />
    </div>
  );
}
