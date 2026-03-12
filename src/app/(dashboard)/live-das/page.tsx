import { DaTable } from "@/components/live-das/da-table";

export const metadata = { title: "Live DAs — AXIOM" };

export default function LiveDAsPage() {
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
          Live Development Applications
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Search real development applications from the NSW Planning Portal by
          council area.
        </p>
      </div>
      <DaTable />
    </div>
  );
}
