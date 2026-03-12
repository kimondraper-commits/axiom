"use client";

import { useState, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Sample parcel data (Parramatta corridor)                           */
/* ------------------------------------------------------------------ */

interface Parcel {
  lotDp: string;
  address: string;
  areaSqm: number;
  zoning: string;
  estimatedValue: number;
  type: "Residential" | "Commercial" | "Government" | "Vacant";
  heritage: boolean;
  status: string;
}

const SAMPLE_PARCELS: Parcel[] = [
  { lotDp: "1/DP102345", address: "12 Church St, Parramatta", areaSqm: 650, zoning: "R4", estimatedValue: 1_800_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "2/DP102345", address: "14 Church St, Parramatta", areaSqm: 580, zoning: "R4", estimatedValue: 1_650_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "3/DP102346", address: "16 Church St, Parramatta", areaSqm: 720, zoning: "B4", estimatedValue: 3_200_000, type: "Commercial", heritage: false, status: "Not Started" },
  { lotDp: "4/DP102347", address: "18 Church St, Parramatta", areaSqm: 890, zoning: "B4", estimatedValue: 4_100_000, type: "Commercial", heritage: true, status: "Not Started" },
  { lotDp: "5/DP102348", address: "20 Church St, Parramatta", areaSqm: 450, zoning: "R4", estimatedValue: 1_350_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "1/DP203456", address: "3 Marsden St, Parramatta", areaSqm: 1200, zoning: "B4", estimatedValue: 5_500_000, type: "Commercial", heritage: false, status: "Not Started" },
  { lotDp: "2/DP203456", address: "5 Marsden St, Parramatta", areaSqm: 340, zoning: "R4", estimatedValue: 980_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "3/DP203457", address: "7 Marsden St, Parramatta", areaSqm: 510, zoning: "R4", estimatedValue: 1_480_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "1/DP304567", address: "22 Wilde Ave, Parramatta", areaSqm: 680, zoning: "R3", estimatedValue: 1_720_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "2/DP304567", address: "24 Wilde Ave, Parramatta", areaSqm: 550, zoning: "R3", estimatedValue: 1_400_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "3/DP304568", address: "26 Wilde Ave, Parramatta", areaSqm: 620, zoning: "R3", estimatedValue: 1_580_000, type: "Residential", heritage: true, status: "Not Started" },
  { lotDp: "4/DP304568", address: "28 Wilde Ave, Parramatta", areaSqm: 780, zoning: "R3", estimatedValue: 1_950_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "1/DP405678", address: "1 Victoria Rd, Parramatta", areaSqm: 2400, zoning: "SP2", estimatedValue: 0, type: "Government", heritage: false, status: "Not Started" },
  { lotDp: "2/DP405679", address: "15 Albert St, Parramatta", areaSqm: 920, zoning: "B4", estimatedValue: 4_300_000, type: "Commercial", heritage: false, status: "Not Started" },
  { lotDp: "3/DP405680", address: "17 Albert St, Parramatta", areaSqm: 460, zoning: "R4", estimatedValue: 1_280_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "1/DP506789", address: "Lot 12 O'Connell St", areaSqm: 1800, zoning: "RE1", estimatedValue: 0, type: "Vacant", heritage: false, status: "Not Started" },
  { lotDp: "2/DP506790", address: "9 Harris St, Parramatta", areaSqm: 530, zoning: "R4", estimatedValue: 1_520_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "3/DP506791", address: "11 Harris St, Parramatta", areaSqm: 490, zoning: "R4", estimatedValue: 1_380_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "4/DP506792", address: "13 Harris St, Parramatta", areaSqm: 610, zoning: "R4", estimatedValue: 1_620_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "5/DP506793", address: "2 Fennell St, Parramatta", areaSqm: 750, zoning: "B4", estimatedValue: 3_800_000, type: "Commercial", heritage: false, status: "Not Started" },
  { lotDp: "1/DP607890", address: "4 Fennell St, Parramatta", areaSqm: 580, zoning: "R4", estimatedValue: 1_650_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "2/DP607891", address: "6 Fennell St, Parramatta", areaSqm: 440, zoning: "R4", estimatedValue: 1_250_000, type: "Residential", heritage: false, status: "Not Started" },
  { lotDp: "3/DP607892", address: "8 Fennell St, Parramatta", areaSqm: 690, zoning: "R3", estimatedValue: 1_780_000, type: "Residential", heritage: false, status: "Not Started" },
];

const STATUTORY_PREMIUM = 1.15;

const cardLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--gold-dim)",
  marginBottom: 12,
};

function fmtDollar(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function AcquisitionPanel() {
  const [bufferM, setBufferM] = useState(50);
  const [selectedCount, setSelectedCount] = useState(23);

  const affected = SAMPLE_PARCELS.slice(0, Math.min(selectedCount, SAMPLE_PARCELS.length));

  const summary = useMemo(() => {
    const totalLandValue = affected.reduce((s, p) => s + p.estimatedValue, 0);
    const acquisitionCost = Math.round(totalLandValue * STATUTORY_PREMIUM);
    const heritageCount = affected.filter((p) => p.heritage).length;
    const byType = affected.reduce(
      (acc, p) => ({ ...acc, [p.type]: (acc[p.type] ?? 0) + 1 }),
      {} as Record<string, number>
    );
    const timelineMonths = 6 + Math.ceil(affected.length / 10);
    return { totalLandValue, acquisitionCost, heritageCount, byType, timelineMonths };
  }, [affected]);

  const inputLabelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
    fontWeight: 400,
    fontSize: 12,
    color: "var(--text-secondary)",
    marginBottom: 4,
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Corridor Parameters</p>
        <div className="flex gap-4">
          <div className="flex-1">
            <label style={inputLabelStyle}>Buffer width (m each side)</label>
            <input
              type="number"
              value={bufferM}
              onChange={(e) => setBufferM(Number(e.target.value))}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label style={inputLabelStyle}>Properties in corridor</label>
            <input
              type="number"
              value={selectedCount}
              onChange={(e) => setSelectedCount(Math.max(1, Math.min(23, Number(e.target.value))))}
              min={1}
              max={23}
              className="w-full"
            />
          </div>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 8 }}>
          Sample corridor through Parramatta CBD. In production, draw a route on the GIS map to auto-detect affected parcels.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <p style={cardLabelStyle}>Properties Affected</p>
          <p
            style={{
              fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
              fontWeight: 700,
              fontSize: 28,
              color: "#DC2626",
            }}
          >
            {affected.length}
          </p>
          <div className="mt-2 space-y-0.5" style={{ fontSize: 11, color: "var(--text-ghost)" }}>
            {Object.entries(summary.byType).map(([type, count]) => (
              <div key={type}>
                {count} {type}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <p style={cardLabelStyle}>Est. Land Value</p>
          <p
            style={{
              fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
              fontWeight: 700,
              fontSize: 28,
              color: "var(--text-primary)",
            }}
          >
            {fmtDollar(summary.totalLandValue)}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }}>
            NSW Valuer General estimates
          </p>
        </div>
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <p style={cardLabelStyle}>Acquisition Cost</p>
          <p
            style={{
              fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
              fontWeight: 700,
              fontSize: 28,
              color: "var(--gold)",
            }}
          >
            {fmtDollar(summary.acquisitionCost)}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }}>
            Land value x 1.15 (statutory premium + costs)
          </p>
        </div>
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <p style={cardLabelStyle}>Est. Timeline</p>
          <p
            style={{
              fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
              fontWeight: 700,
              fontSize: 28,
              color: "var(--text-primary)",
            }}
          >
            {summary.timelineMonths}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 4 }}>
            months (6 base + 1 per 10 properties)
          </p>
          {summary.heritageCount > 0 && (
            <p style={{ fontSize: 11, color: "#D97706", marginTop: 4 }}>
              {summary.heritageCount} heritage item(s) — may extend timeline
            </p>
          )}
        </div>
      </div>

      {/* Property Table */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Affected Properties</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Lot/DP", "Address", "Area", "Zoning", "Value", "Type", "Heritage"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                        fontSize: 10,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "var(--gold-dim)",
                        padding: "8px 8px",
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {affected.map((p) => (
                <tr key={p.lotDp} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td
                    style={{
                      padding: "8px",
                      fontSize: 12,
                      fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                      color: "var(--gold)",
                    }}
                  >
                    {p.lotDp}
                  </td>
                  <td style={{ padding: "8px", fontSize: 12, color: "var(--text-primary)" }}>
                    {p.address}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                    }}
                  >
                    {p.areaSqm.toLocaleString()} m²
                  </td>
                  <td style={{ padding: "8px", fontSize: 12, color: "var(--text-secondary)" }}>
                    {p.zoning}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      fontSize: 12,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                    }}
                  >
                    {p.estimatedValue > 0 ? fmtDollar(p.estimatedValue) : "—"}
                  </td>
                  <td style={{ padding: "8px", fontSize: 12, color: "var(--text-secondary)" }}>
                    {p.type}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {p.heritage && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          color: "#D97706",
                          background: "rgba(217, 119, 6, 0.1)",
                          border: "1px solid rgba(217, 119, 6, 0.3)",
                        }}
                      >
                        HERITAGE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 10, color: "var(--text-ghost)", marginTop: 12 }}>
          Sample data — Parramatta corridor. Production version uses NSW Cadastre + Valuer General data.
        </p>
      </div>
    </div>
  );
}
