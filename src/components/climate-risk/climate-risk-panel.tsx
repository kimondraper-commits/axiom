"use client";

const RISK_LAYERS = [
  {
    name: "Flood Planning Area",
    category: "Flood",
    severity: "High",
    description:
      "Shows the 1% Annual Exceedance Probability (AEP) flood extent — the area with a 1-in-100 chance of flooding in any given year. Properties within this zone are subject to flood-related development controls under NSW planning legislation.",
    source: "NSW SES Flood Data Portal",
    color: "#3B82F6",
  },
  {
    name: "Bushfire Prone Land",
    category: "Bushfire",
    severity: "High",
    description:
      "Certified Bushfire Prone Land map identifying areas at risk. Vegetation Category 1 (highest risk) requires BAL assessment under AS 3959 and Planning for Bush Fire Protection 2019. Development within these zones requires a Bush Fire Safety Authority (BFSA).",
    source: "NSW Rural Fire Service (RFS)",
    color: "#DC2626",
  },
  {
    name: "Coastal Erosion Hazard",
    category: "Coastal",
    severity: "Medium",
    description:
      "Coastal vulnerability zones mapped under the NSW Coastal Management Act 2016 and State Environmental Planning Policy (Resilience and Hazards) 2021. Shows areas at risk of shoreline recession, coastal inundation, and cliff instability.",
    source: "NSW DPHI ePlanning Spatial Services",
    color: "#F59E0B",
  },
  {
    name: "Acid Sulfate Soils",
    category: "Soil",
    severity: "Medium",
    description:
      "Areas containing acid sulfate soils that can release sulfuric acid when disturbed. Development in Class 1-3 areas requires an Acid Sulfate Soils Management Plan under Clause 7.1 of the Standard Instrument LEP.",
    source: "NSW DPHI ePlanning Spatial Services",
    color: "#8B5CF6",
  },
  {
    name: "Wetlands",
    category: "Environment",
    severity: "Low",
    description:
      "SEPP-mapped coastal wetlands and proximity areas. Development within 100m of a coastal wetland requires assessment under the Coastal Management SEPP. These areas provide critical ecosystem services including flood mitigation.",
    source: "NSW DPHI ePlanning Spatial Services",
    color: "#10B981",
  },
  {
    name: "Riparian Lands",
    category: "Environment",
    severity: "Low",
    description:
      "Watercourse corridors and riparian buffer zones. Development near waterways is regulated under the Water Management Act 2000 and requires controlled activity approvals from the Natural Resources Access Regulator (NRAR).",
    source: "NSW DPHI ePlanning Spatial Services",
    color: "#06B6D4",
  },
];

const severityColor: Record<string, string> = {
  High: "#DC2626",
  Medium: "#D97706",
  Low: "#059669",
};

const cardLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--gold-dim)",
  marginBottom: 12,
};

export function ClimateRiskPanel() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Climate &amp; Disaster Risk Overview</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          AXIOM integrates multiple NSW government spatial datasets to provide a
          comprehensive view of natural hazard and climate risks affecting
          development sites. These layers are sourced from official government
          registers and comply with current NSW planning legislation including the
          EP&A Act 1979, Coastal Management Act 2016, and Rural Fires Act 1997.
        </p>
      </div>

      {/* Risk Summary Table */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Risk Layer Summary</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["Layer", "Category", "Severity", "Data Source"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "var(--gold-dim)",
                      padding: "8px 12px",
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISK_LAYERS.map((layer) => (
                <tr
                  key={layer.name}
                  style={{
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: layer.color,
                        marginRight: 8,
                      }}
                    />
                    {layer.name}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)" }}>
                    {layer.category}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                        fontSize: 10,
                        letterSpacing: 1,
                        padding: "2px 8px",
                        borderRadius: 4,
                        color: severityColor[layer.severity],
                        background: `${severityColor[layer.severity]}18`,
                        border: `1px solid ${severityColor[layer.severity]}40`,
                      }}
                    >
                      {layer.severity}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-ghost)" }}>
                    {layer.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Layer Descriptions */}
      <div className="grid grid-cols-2 gap-4">
        {RISK_LAYERS.map((layer) => (
          <div
            key={layer.name}
            style={{
              background: "var(--carbon)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: layer.color,
                borderRadius: "8px 0 0 8px",
              }}
            />
            <div className="flex items-center gap-2 mb-2">
              <p
                style={{
                  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--gold-dim)",
                }}
              >
                {layer.name}
              </p>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                  fontSize: 9,
                  letterSpacing: 1,
                  padding: "1px 6px",
                  borderRadius: 4,
                  color: severityColor[layer.severity],
                  background: `${severityColor[layer.severity]}18`,
                  border: `1px solid ${severityColor[layer.severity]}40`,
                }}
              >
                {layer.severity}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {layer.description}
            </p>
            <p style={{ fontSize: 10, color: "var(--text-ghost)", marginTop: 8 }}>
              Source: {layer.source}
            </p>
          </div>
        ))}
      </div>

      {/* Map reference */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border-active)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>View on Map</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          All climate and hazard layers are available as toggleable overlays on the{" "}
          <a
            href="/maps"
            style={{ color: "var(--gold)", textDecoration: "underline" }}
          >
            GIS Maps
          </a>{" "}
          page. Toggle layers on via the layer panel to visualise risk zones
          overlaid on the cadastre and planning layers. Click any parcel to see a
          composite risk summary.
        </p>
        <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 8 }}>
          Data: NSW RFS, NSW SES, NSW DPHI, Bureau of Meteorology
        </p>
      </div>
    </div>
  );
}
