"use client";

import { useState, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Sample subsurface data (Parramatta area)                           */
/* ------------------------------------------------------------------ */

interface SubsurfaceFeature {
  id: string;
  name: string;
  type: "contamination" | "geology" | "bore" | "drainage";
  lat: number;
  lng: number;
  status: "active" | "managed" | "remediated";
  details: string;
}

const SAMPLE_FEATURES: SubsurfaceFeature[] = [
  {
    id: "c1",
    name: "Former Parramatta Gasworks",
    type: "contamination",
    lat: -33.8148,
    lng: 151.0035,
    status: "managed",
    details: "PAH and heavy metal contamination. Under long-term environmental management plan. EPA notice active.",
  },
  {
    id: "c2",
    name: "Clyde Rail Yards",
    type: "contamination",
    lat: -33.8365,
    lng: 151.0182,
    status: "active",
    details: "Hydrocarbon contamination from former rail maintenance facility. Groundwater monitoring ongoing.",
  },
  {
    id: "c3",
    name: "Duck River Industrial Area",
    type: "contamination",
    lat: -33.8312,
    lng: 151.0267,
    status: "remediated",
    details: "Former manufacturing site. Remediation completed 2019. EPA audit statement issued.",
  },
  {
    id: "g1",
    name: "Parramatta CBD — Wianamatta Shale",
    type: "geology",
    lat: -33.8151,
    lng: 151.0052,
    status: "managed",
    details: "Wianamatta Group shale. Reactive clay soils, moderate foundation risk. Standard H2 classification.",
  },
  {
    id: "g2",
    name: "Rydalmere — Ashfield Shale",
    type: "geology",
    lat: -33.8078,
    lng: 151.0347,
    status: "managed",
    details: "Ashfield Shale formation. Good bearing capacity, low groundwater risk. Standard H1 classification.",
  },
  {
    id: "b1",
    name: "Parramatta Park Monitoring Bore",
    type: "bore",
    lat: -33.8128,
    lng: 150.9982,
    status: "managed",
    details: "Groundwater monitoring bore. Depth: 12m. Water table at 6m. Quarterly sampling by Sydney Water.",
  },
  {
    id: "b2",
    name: "Westmead Hospital Bore",
    type: "bore",
    lat: -33.8076,
    lng: 150.9875,
    status: "managed",
    details: "Groundwater extraction bore. Depth: 25m. Licensed 0.5 ML/year. WaterNSW licence WAL-12345.",
  },
  {
    id: "d1",
    name: "Church St Trunk Drain",
    type: "drainage",
    lat: -33.8165,
    lng: 151.0027,
    status: "managed",
    details: "900mm RCP trunk stormwater drain. Council asset, installed 1975. Fair condition (2021 CCTV inspection).",
  },
  {
    id: "d2",
    name: "Parramatta River Flood Culvert",
    type: "drainage",
    lat: -33.8145,
    lng: 151.0095,
    status: "managed",
    details: "Twin 1200mm box culvert under Marsden St. Capacity: 8.5 m³/s. Critical flood infrastructure.",
  },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  contamination: { label: "Contaminated Site", color: "#DC2626", icon: "☣" },
  geology: { label: "Geological Feature", color: "#8B5CF6", icon: "◆" },
  bore: { label: "Groundwater Bore", color: "#3B82F6", icon: "◎" },
  drainage: { label: "Drainage Infrastructure", color: "#06B6D4", icon: "▬" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Active Contamination", color: "#DC2626" },
  managed: { label: "Under Management", color: "#D97706" },
  remediated: { label: "Remediated", color: "#059669" },
};

const cardLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--gold-dim)",
  marginBottom: 12,
};

export function SubsurfacePanel() {
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = useMemo(
    () =>
      filterType === "all"
        ? SAMPLE_FEATURES
        : SAMPLE_FEATURES.filter((f) => f.type === filterType),
    [filterType]
  );

  const summary = useMemo(() => {
    const byType = SAMPLE_FEATURES.reduce(
      (acc, f) => ({ ...acc, [f.type]: (acc[f.type] ?? 0) + 1 }),
      {} as Record<string, number>
    );
    const byStatus = SAMPLE_FEATURES.reduce(
      (acc, f) => ({ ...acc, [f.status]: (acc[f.status] ?? 0) + 1 }),
      {} as Record<string, number>
    );
    return { byType, byStatus, total: SAMPLE_FEATURES.length };
  }, []);

  const riskLevel =
    summary.byStatus.active && summary.byStatus.active > 0
      ? "HIGH"
      : summary.total > 5
        ? "MODERATE"
        : "LOW";
  const riskColor =
    riskLevel === "HIGH" ? "#DC2626" : riskLevel === "MODERATE" ? "#D97706" : "#059669";

  return (
    <div className="space-y-6">
      {/* Risk Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <p style={cardLabelStyle}>Total Features</p>
          <p
            style={{
              fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
              fontWeight: 700,
              fontSize: 32,
              color: "var(--text-primary)",
            }}
          >
            {summary.total}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-ghost)", marginTop: 4 }}>
            within 500m radius
          </p>
        </div>
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <p style={cardLabelStyle}>Subsurface Risk Level</p>
          <p
            style={{
              fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
              fontWeight: 700,
              fontSize: 32,
              color: riskColor,
            }}
          >
            {riskLevel}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-ghost)", marginTop: 4 }}>
            {summary.byStatus.active ?? 0} active contamination site(s)
          </p>
        </div>
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <p style={cardLabelStyle}>Feature Breakdown</p>
          <div className="space-y-1">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <div
                key={key}
                className="flex justify-between"
                style={{ fontSize: 12, color: "var(--text-secondary)" }}
              >
                <span>
                  <span style={{ color: cfg.color, marginRight: 6 }}>{cfg.icon}</span>
                  {cfg.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                    fontSize: 11,
                    color: "var(--text-ghost)",
                  }}
                >
                  {summary.byType[key] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({
              value: k,
              label: v.label,
            })),
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className="px-3 py-1.5 text-xs rounded-md border font-medium transition-colors"
              style={
                filterType === opt.value
                  ? {
                      background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
                      color: "var(--void)",
                      borderColor: "var(--gold)",
                    }
                  : {
                      background: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                      borderColor: "var(--border)",
                    }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature List */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Subsurface Features — Parramatta Area (Sample Data)</p>
        <div className="space-y-3">
          {filtered.map((f) => {
            const typeConfig = TYPE_CONFIG[f.type];
            const statusConfig = STATUS_CONFIG[f.status];
            return (
              <div
                key={f.id}
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 16,
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
                    background: typeConfig.color,
                    borderRadius: "8px 0 0 8px",
                  }}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: typeConfig.color, fontSize: 14 }}>
                        {typeConfig.icon}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {f.name}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                        marginTop: 4,
                      }}
                    >
                      {f.details}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                      fontSize: 9,
                      letterSpacing: 1,
                      padding: "2px 8px",
                      borderRadius: 4,
                      color: statusConfig.color,
                      background: `${statusConfig.color}18`,
                      border: `1px solid ${statusConfig.color}40`,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {statusConfig.label}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                    fontSize: 10,
                    color: "var(--text-ghost)",
                    marginTop: 6,
                  }}
                >
                  {typeConfig.label} · {f.lat.toFixed(4)}, {f.lng.toFixed(4)}
                </p>
              </div>
            );
          })}
        </div>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-ghost)",
            marginTop: 12,
          }}
        >
          Data: NSW Geological Survey (MinView), NSW EPA Contaminated Land Register, City of Parramatta Council
        </p>
      </div>
    </div>
  );
}
