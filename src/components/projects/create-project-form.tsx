"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ABS_AVG_HOUSEHOLD_SIZE,
  ABS_GROWTH_RATE_PCT,
  FTE_PER_MILLION,
  RESIDENTIAL_FTE,
  COMMERCIAL_DENSITY_M2,
  RETAIL_SPEND_PER_PERSON,
} from "@/lib/reference-data";

const NSW_LGAS = [
  "Albury", "Armidale Regional", "Ballina", "Balranald", "Bathurst Regional",
  "Bayside", "Bega Valley", "Bellingen", "Berrigan", "Blacktown", "Bland",
  "Blayney", "Blue Mountains", "Bogan", "Bourke", "Brewarrina", "Broken Hill",
  "Burwood", "Byron", "Cabonne", "Camden", "Campbelltown", "Canada Bay",
  "Canterbury-Bankstown", "Central Coast", "Cessnock", "Clarence Valley",
  "Cobar", "Coffs Harbour", "Coolamon", "Coonamble", "Cootamundra-Gundagai",
  "Cowra", "Cumberland", "Dubbo Regional", "Dungog", "Edward River",
  "Eurobodalla", "Fairfield", "Forbes", "Georges River", "Gilgandra",
  "Glen Innes Severn", "Goulburn Mulwaree", "Greater Hume Shire",
];

const PROJECT_TYPES = [
  "Residential — Low Density",
  "Residential — Medium Density",
  "Residential — High Density",
  "Mixed-Use",
  "Commercial / Retail",
  "Industrial",
  "Community / Civic",
  "Infrastructure",
];

const MILESTONE_SEEDS = [
  "Pre-lodgement Meeting",
  "DA Preparation",
  "DA Lodgement",
  "Agency Referrals",
  "Public Exhibition",
  "Assessment",
  "Determination",
  "Post-Approval Conditions",
  "Construction Certificate",
  "Occupation Certificate",
];

const COMPLIANCE_RESIDENTIAL = [
  "SEPP (Housing) 2021 check",
  "DCP setback requirements",
  "Height control compliance",
  "Minimum lot size",
  "Car parking rates",
  "Landscaping requirements",
  "Stormwater management plan",
  "Flood risk assessment",
  "Bushfire assessment",
  "Heritage impact statement",
  "Traffic impact assessment",
  "Acoustic assessment",
  "Contamination investigation",
  "Aboriginal heritage due diligence",
  "BASIX certificate",
  "Section 7.12 contributions",
];

const COMPLIANCE_MIXED = [
  "SEPP (Transport and Infrastructure)",
  "DCP compliance",
  "FSR compliance",
  "Height compliance",
  "Car parking (commercial rates)",
  "Loading/servicing",
  "Waste management",
  "Accessibility (BCA)",
  "Signage controls",
  "Contamination",
  "Aboriginal heritage",
  "s7.12 contributions",
];

const COMPLIANCE_GENERIC = [
  "Zoning compliance",
  "Height controls",
  "Setback requirements",
  "Parking requirements",
  "Landscaping requirements",
  "Stormwater management",
  "Environmental assessment",
  "Heritage assessment",
  "Traffic assessment",
  "s7.12 contributions",
];

function getComplianceItems(projectType: string) {
  if (projectType.startsWith("Residential")) return COMPLIANCE_RESIDENTIAL;
  if (projectType === "Mixed-Use" || projectType === "Commercial / Retail") return COMPLIANCE_MIXED;
  return COMPLIANCE_GENERIC;
}

function calcImpacts(fields: {
  dwellings: string;
  commercialGfa: string;
  siteAreaHa: string;
  constructionCostM: string;
  greenSpaceHa: string;
}) {
  const dwellings = parseFloat(fields.dwellings) || 0;
  const commercialGfa = parseFloat(fields.commercialGfa) || 0;
  const siteAreaHa = parseFloat(fields.siteAreaHa) || 0;
  const constructionCostM = parseFloat(fields.constructionCostM) || 0;
  const greenSpaceHa = parseFloat(fields.greenSpaceHa) || 0;

  const population = dwellings * ABS_AVG_HOUSEHOLD_SIZE;
  const popDensity = siteAreaHa > 0 ? population / (siteAreaHa / 100) : 0;
  const projection30yr = population * Math.pow(1 + ABS_GROWTH_RATE_PCT / 100, 30);
  const constructionFTEs = constructionCostM * FTE_PER_MILLION;
  const ongoingJobs = dwellings * RESIDENTIAL_FTE + commercialGfa / COMMERCIAL_DENSITY_M2;
  const retailSpending = population * RETAIL_SPEND_PER_PERSON;

  let score = 0;
  if (popDensity > 5000) score += 25;
  else if (popDensity > 2000) score += 15;
  else if (popDensity > 500) score += 8;
  if (commercialGfa > 0) score += 20;
  if (greenSpaceHa > 0) {
    score += Math.min(25, (greenSpaceHa / (siteAreaHa || 1)) * 100);
  }
  if (dwellings > 0) score += 20;
  score = Math.min(100, Math.round(score));

  return { population, popDensity, projection30yr, constructionFTEs, ongoingJobs, retailSpending, sustainabilityScore: score };
}

const labelStyle: React.CSSProperties = { display: "block", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 400, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 };

interface SiteSummary {
  zone: string | null;
  lotArea: string | null;
  floodRisk: string | null;
  heritage: string | null;
  bushfire: string | null;
  heightLimit: string | null;
  fsr: string | null;
  acidSulfate: string | null;
  lga: string | null;
}

export function CreateProjectForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [siteSummary, setSiteSummary] = useState<SiteSummary | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [fields, setFields] = useState({
    title: "",
    address: "",
    lga: "",
    projectType: "",
    description: "",
    applicantName: "",
    applicantEmail: "",
    lodgementDate: "",
    dwellings: "",
    commercialGfa: "",
    buildingHeight: "",
    storeys: "",
    carParking: "",
    siteAreaHa: "",
    constructionCostM: "",
    greenSpaceHa: "",
  });

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function lookupSite() {
    if (!fields.address) {
      setError("Enter a site address first.");
      return;
    }
    setLookingUp(true);
    setError("");
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
      const geoRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fields.address)}.json?country=au&limit=1&access_token=${token}`
      );
      const geoJson = await geoRes.json();
      const feature = geoJson.features?.[0];
      if (!feature) {
        setError("Could not geocode address. Try a more specific NSW address.");
        setLookingUp(false);
        return;
      }
      const [lng, lat] = feature.center as [number, number];
      const parcelRes = await fetch(`/api/maps/parcels?lng=${lng}&lat=${lat}`);
      const parcelJson = await parcelRes.json();
      const d = parcelJson.data;
      if (!d) {
        setError("No parcel data found at this location.");
        setLookingUp(false);
        return;
      }
      setSiteSummary({
        zone: d.zone,
        lotArea: d.lotArea,
        floodRisk: d.floodRisk,
        heritage: d.heritage,
        bushfire: d.bushfire,
        heightLimit: d.heightLimit,
        fsr: d.fsr,
        acidSulfate: d.acidSulfate,
        lga: d.lga,
      });
      if (d.lga && !fields.lga) {
        setFields((f) => ({ ...f, lga: d.lga }));
      }
    } catch {
      setError("GIS lookup failed. Try again later.");
    } finally {
      setLookingUp(false);
    }
  }

  const impacts = calcImpacts(fields);

  async function submit(nswStatus: string, status: string) {
    if (!fields.title || !fields.address) {
      setError("Title and address are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.title,
          description: fields.description || undefined,
          city: fields.lga || fields.address,
          address: fields.address,
          status,
          nswStatus,
          lga: fields.lga || undefined,
          projectType: fields.projectType || undefined,
          applicantName: fields.applicantName || undefined,
          applicantEmail: fields.applicantEmail || undefined,
          lodgementDate: fields.lodgementDate ? new Date(fields.lodgementDate).toISOString() : undefined,
          dwellings: fields.dwellings ? parseInt(fields.dwellings) : undefined,
          commercialGfa: fields.commercialGfa ? parseFloat(fields.commercialGfa) : undefined,
          buildingHeight: fields.buildingHeight ? parseFloat(fields.buildingHeight) : undefined,
          storeys: fields.storeys ? parseInt(fields.storeys) : undefined,
          carParking: fields.carParking ? parseInt(fields.carParking) : undefined,
          siteAreaHa: fields.siteAreaHa ? parseFloat(fields.siteAreaHa) : undefined,
          constructionCostM: fields.constructionCostM ? parseFloat(fields.constructionCostM) : undefined,
          greenSpaceHa: fields.greenSpaceHa ? parseFloat(fields.greenSpaceHa) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || "Failed to create project.");
        setSaving(false);
        return;
      }

      const projectId = data.data.id;

      const complianceLabels = getComplianceItems(fields.projectType);
      const complianceItems = complianceLabels.map((label, i) => {
        const item: { label: string; sortOrder: number; flagged?: boolean; notes?: string } = { label, sortOrder: i };
        if (siteSummary) {
          if (label.toLowerCase().includes("bushfire") && siteSummary.bushfire) {
            item.flagged = true;
            item.notes = `GIS: ${siteSummary.bushfire}`;
          }
          if (label.toLowerCase().includes("flood") && siteSummary.floodRisk) {
            item.flagged = true;
            item.notes = `GIS: ${siteSummary.floodRisk}`;
          }
          if (label.toLowerCase().includes("heritage") && siteSummary.heritage) {
            item.flagged = true;
            item.notes = `GIS: ${siteSummary.heritage}`;
          }
          if (label.toLowerCase().includes("contamination") && siteSummary.acidSulfate) {
            item.flagged = true;
            item.notes = `GIS: Acid Sulfate Soils — ${siteSummary.acidSulfate}`;
          }
        }
        return item;
      });
      await fetch(`/api/projects/${projectId}/compliance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complianceItems),
      });

      await fetch(`/api/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(MILESTONE_SEEDS.map((name, i) => ({ name, sortOrder: i }))),
      });

      router.push(`/projects/${projectId}`);
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/projects" style={{ fontSize: 13, color: "var(--text-ghost)", display: "block", marginBottom: 4 }}>
          ← Projects
        </Link>
        <h1 style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", fontWeight: 600, fontSize: 22, letterSpacing: 1, color: "var(--text-primary)" }}>New Project</h1>
        <p style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 300, fontSize: 13, color: "var(--text-ghost)", marginTop: 4 }}>Create a new NSW DA project record</p>
      </div>

      {error && (
        <div className="mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, padding: "12px 16px", borderRadius: 6 }}>
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1 — Project Basics */}
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 16 }}>Project Basics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label style={labelStyle}>Project Title *</label>
              <input type="text" value={fields.title} onChange={set("title")} className="w-full" placeholder="e.g. 12 Smith Street Residential Development" />
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Site Address *</label>
              <input type="text" value={fields.address} onChange={set("address")} className="w-full" placeholder="Full street address" />
            </div>
            <div>
              <label style={labelStyle}>LGA</label>
              <select value={fields.lga} onChange={set("lga")} className="w-full">
                <option value="">Select LGA…</option>
                {NSW_LGAS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Project Type</label>
              <select value={fields.projectType} onChange={set("projectType")} className="w-full">
                <option value="">Select type…</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Description</label>
              <textarea value={fields.description} onChange={set("description")} className="w-full" rows={3} placeholder="Brief project description…" />
            </div>
            <div>
              <label style={labelStyle}>Applicant Name</label>
              <input type="text" value={fields.applicantName} onChange={set("applicantName")} className="w-full" />
            </div>
            <div>
              <label style={labelStyle}>Applicant Email</label>
              <input type="email" value={fields.applicantEmail} onChange={set("applicantEmail")} className="w-full" />
            </div>
            <div>
              <label style={labelStyle}>Lodgement Date</label>
              <input type="date" value={fields.lodgementDate} onChange={set("lodgementDate")} className="w-full" />
            </div>
          </div>
        </div>

        {/* Section 2 — Proposal Details */}
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 16 }}>Proposal Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label style={labelStyle}>Dwellings</label><input type="number" min="0" value={fields.dwellings} onChange={set("dwellings")} className="w-full" placeholder="0" /></div>
            <div><label style={labelStyle}>Commercial GFA (m²)</label><input type="number" min="0" value={fields.commercialGfa} onChange={set("commercialGfa")} className="w-full" placeholder="0" /></div>
            <div><label style={labelStyle}>Building Height (m)</label><input type="number" min="0" step="0.1" value={fields.buildingHeight} onChange={set("buildingHeight")} className="w-full" placeholder="0" /></div>
            <div><label style={labelStyle}>Storeys</label><input type="number" min="0" value={fields.storeys} onChange={set("storeys")} className="w-full" placeholder="0" /></div>
            <div><label style={labelStyle}>Car Parking</label><input type="number" min="0" value={fields.carParking} onChange={set("carParking")} className="w-full" placeholder="0" /></div>
            <div><label style={labelStyle}>Site Area (ha)</label><input type="number" min="0" step="0.001" value={fields.siteAreaHa} onChange={set("siteAreaHa")} className="w-full" placeholder="0" /></div>
            <div><label style={labelStyle}>Construction Cost ($M)</label><input type="number" min="0" step="0.1" value={fields.constructionCostM} onChange={set("constructionCostM")} className="w-full" placeholder="0" /></div>
            <div><label style={labelStyle}>Green Space (ha)</label><input type="number" min="0" step="0.001" value={fields.greenSpaceHa} onChange={set("greenSpaceHa")} className="w-full" placeholder="0" /></div>
          </div>
        </div>

        {/* Section 3 — Site Summary */}
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3, padding: 24 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>Site Summary</h2>
              <p style={{ fontSize: 11, color: "var(--text-ghost)" }}>
                <a href="https://www.planningportal.nsw.gov.au/spatialviewer" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>
                  Open NSW Planning Portal Map →
                </a>
              </p>
            </div>
            <button
              type="button"
              onClick={lookupSite}
              disabled={lookingUp || !fields.address}
              style={{
                border: "1px solid var(--border-active)",
                color: "var(--gold)",
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                opacity: lookingUp || !fields.address ? 0.5 : 1,
              }}
            >
              {lookingUp ? "Looking up…" : "Lookup site from GIS"}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {([
              { label: "Zoning", value: siteSummary?.zone },
              { label: "Lot Size", value: siteSummary?.lotArea },
              { label: "Flood Zone", value: siteSummary?.floodRisk },
              { label: "Heritage Area", value: siteSummary?.heritage },
              { label: "Bushfire Land", value: siteSummary?.bushfire },
              { label: "Key Controls", value: siteSummary ? [siteSummary.heightLimit ? `Height: ${siteSummary.heightLimit}` : null, siteSummary.fsr ? `FSR: ${siteSummary.fsr}` : null, siteSummary.acidSulfate ? `Acid Sulfate: ${siteSummary.acidSulfate}` : null].filter(Boolean).join(", ") || null : null },
            ] as { label: string; value: string | null | undefined }[]).map(({ label, value }) => (
              <div key={label} style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 12, background: "var(--slate)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: value ? "var(--text-primary)" : "var(--text-ghost)", fontStyle: value ? "normal" : "italic", fontWeight: value ? 500 : 400 }}>
                  {value || (siteSummary ? "Not applicable" : "Enter address and click Lookup")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 — Auto-Calculated Impact Estimates */}
        <div style={{ background: "var(--gold-glow)", border: "1px solid var(--border-active)", borderRadius: 3, padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>Auto-Calculated Impact Estimates</h2>
          <p style={{ fontSize: 11, color: "var(--gold)", marginBottom: 16 }}>Updates live as you enter proposal details above</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ImpactCard label="Est. Population" value={fmt(impacts.population, 0)} sub="residents" />
            <ImpactCard label="Pop. Density" value={fmt(impacts.popDensity, 0)} sub="persons/km²" />
            <ImpactCard label="30-yr Projection" value={fmt(impacts.projection30yr, 0)} sub="residents" />
            <ImpactCard label="Construction FTEs" value={fmt(impacts.constructionFTEs, 0)} sub="jobs" />
            <ImpactCard label="Ongoing Jobs" value={fmt(impacts.ongoingJobs, 0)} sub="jobs" />
            <ImpactCard label="Retail Spending" value={`$${(impacts.retailSpending / 1_000_000).toFixed(1)}M`} sub="per year" />
            <ImpactCard
              label="Sustainability Score"
              value={`${impacts.sustainabilityScore}/100`}
              sub={impacts.sustainabilityScore >= 70 ? "Strong" : impacts.sustainabilityScore >= 40 ? "Moderate" : "Low"}
            />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 12 }}>
            Estimates only. Formulas reference ABS, DCCEW and NSW planning standards.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => submit("Pre-lodgement", "PLANNING")}
            disabled={saving}
            style={{ border: "1px solid var(--border-active)", color: "var(--text-secondary)", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 500, opacity: saving ? 0.5 : 1 }}
          >
            {saving ? "Saving…" : "Save as Draft"}
          </button>
          <button
            onClick={() => submit("Under Assessment", "ACTIVE")}
            disabled={saving}
            style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.5 : 1 }}
          >
            {saving ? "Creating…" : "Create Project"}
          </button>
          <Link href="/projects" className="ml-auto" style={{ fontSize: 13, color: "var(--text-ghost)" }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
      <div style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>{sub}</div>
    </div>
  );
}

function fmt(n: number, decimals: number) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: decimals });
}
