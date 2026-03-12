import { SubmissionsTracker } from "@/components/submissions/submissions-tracker";

export const metadata = { title: "Community Submissions — AXIOM" };

export default function SubmissionsPage() {
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
          Community Submissions
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Track and manage community feedback on development projects.
          Analyse sentiment, categorise concerns, and document responses.
        </p>
      </div>
      <SubmissionsTracker />
    </div>
  );
}
