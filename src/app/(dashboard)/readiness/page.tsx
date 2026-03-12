import { ReadinessScorecard } from "@/components/readiness/readiness-scorecard";

export const metadata = { title: "Project Readiness — AXIOM" };

export default function ReadinessPage() {
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
          Project Readiness Scorecard
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Evaluate whether an infrastructure project is ready to proceed based
          on 7 weighted criteria aligned with NSW assurance frameworks.
        </p>
      </div>
      <ReadinessScorecard />
    </div>
  );
}
