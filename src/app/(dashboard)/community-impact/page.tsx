import { ImpactDashboard } from "@/components/community-impact/impact-dashboard";

export const metadata = { title: "Community Impact — AXIOM" };

export default function CommunityImpactPage() {
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
          Community Impact Dashboard
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Assess the impact of a proposed development on surrounding local
          infrastructure, services, and transport networks.
        </p>
      </div>
      <ImpactDashboard />
    </div>
  );
}
