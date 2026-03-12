import { SubsurfacePanel } from "@/components/subsurface/subsurface-panel";

export const metadata = { title: "Subsurface Assets — AXIOM" };

export default function SubsurfacePage() {
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
          Subsurface Asset Layer
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Underground infrastructure, geology, contamination, and drainage data
          for project site assessment.
        </p>
      </div>
      <SubsurfacePanel />
    </div>
  );
}
