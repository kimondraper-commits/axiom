import { BiodiversityPanel } from "@/components/biodiversity/biodiversity-panel";

export const metadata = { title: "Biodiversity Screening — AXIOM" };

export default function BiodiversityPage() {
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
          Biodiversity Screening
        </h1>
        <p
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 14,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          Check for threatened species records near a project site using the NSW
          BioNet Atlas database.
        </p>
      </div>
      <BiodiversityPanel />
    </div>
  );
}
