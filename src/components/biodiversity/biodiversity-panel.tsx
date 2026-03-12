"use client";

import { useState, useCallback } from "react";

interface SpeciesRecord {
  scientificName: string;
  commonName: string;
  conservationStatus: string;
  lastSightingDate: string;
  distanceKm: number;
}

const cardLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--gold-dim)",
  marginBottom: 12,
};

const STATUS_COLORS: Record<string, string> = {
  Endangered: "#DC2626",
  "Critically Endangered": "#991B1B",
  Vulnerable: "#D97706",
  "Near Threatened": "#F59E0B",
};

export function BiodiversityPanel() {
  const [lat, setLat] = useState(-33.8151);
  const [lng, setLng] = useState(151.0052);
  const [radiusKm, setRadiusKm] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [species, setSpecies] = useState<SpeciesRecord[]>([]);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/data-sources/bionet?lat=${lat}&lng=${lng}&radius=${radiusKm}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const records: SpeciesRecord[] = (json.data ?? []).map(
        (d: Record<string, string>) => ({
          scientificName: d.scientificName ?? d.ScientificName ?? "Unknown",
          commonName: d.commonName ?? d.VernacularName ?? "",
          conservationStatus: d.conservationStatus ?? d.SensitivityClass ?? "Unknown",
          lastSightingDate: d.lastSightingDate ?? d.EndDate ?? "",
          distanceKm: parseFloat(d.distanceKm ?? "0"),
        })
      );
      setSpecies(records);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setSpecies([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radiusKm]);

  const threatened = species.filter(
    (s) =>
      s.conservationStatus.includes("Endangered") ||
      s.conservationStatus.includes("Vulnerable") ||
      s.conservationStatus.includes("Threatened")
  );

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
      {/* Search */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Site Location</p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label style={inputLabelStyle}>Latitude</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              step={0.001}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label style={inputLabelStyle}>Longitude</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              step={0.001}
              className="w-full"
            />
          </div>
          <div style={{ width: 120 }}>
            <label style={inputLabelStyle}>Radius (km)</label>
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              min={1}
              max={10}
              className="w-full"
            />
          </div>
          <button
            onClick={search}
            disabled={loading}
            className="px-6 py-2.5 text-sm rounded-md border font-medium transition-colors"
            style={{
              background: loading
                ? "var(--bg-tertiary)"
                : "linear-gradient(135deg, var(--gold-dim), var(--gold))",
              color: loading ? "var(--text-ghost)" : "var(--void)",
              borderColor: "var(--gold)",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Screen Site"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            borderRadius: 8,
            padding: 14,
            fontSize: 13,
            color: "var(--status-error)",
          }}
        >
          {error}
        </div>
      )}

      {/* Result Banner */}
      {searched && !error && (
        <>
          <div
            style={{
              background:
                threatened.length > 0
                  ? "rgba(220, 38, 38, 0.08)"
                  : "rgba(5, 150, 105, 0.08)",
              border: `1px solid ${
                threatened.length > 0
                  ? "rgba(220, 38, 38, 0.3)"
                  : "rgba(5, 150, 105, 0.3)"
              }`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
                fontWeight: 700,
                fontSize: 18,
                color:
                  threatened.length > 0 ? "#DC2626" : "#059669",
              }}
            >
              {threatened.length > 0
                ? "Biodiversity Assessment Required"
                : "No Threatened Species Records Found"}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 4,
              }}
            >
              {threatened.length > 0
                ? `${threatened.length} threatened species recorded within ${radiusKm}km. A Biodiversity Development Assessment Report (BDAR) may be required under the NSW Biodiversity Conservation Act 2016.`
                : `No threatened species sightings recorded within ${radiusKm}km of the site. Standard biodiversity assessment may still be required depending on vegetation clearing thresholds.`}
            </p>
          </div>

          {/* Species Table */}
          {species.length > 0 && (
            <div
              style={{
                background: "var(--carbon)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <p style={cardLabelStyle}>
                Species Records — {species.length} found
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {[
                        "Scientific Name",
                        "Common Name",
                        "Conservation Status",
                        "Last Sighting",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            fontFamily:
                              "var(--font-jetbrains, 'PT Mono', monospace)",
                            fontSize: 10,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            color: "var(--gold-dim)",
                            padding: "8px 10px",
                            textAlign: "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {species.map((s, i) => {
                      const statusColor =
                        Object.entries(STATUS_COLORS).find(([k]) =>
                          s.conservationStatus.includes(k)
                        )?.[1] ?? "var(--text-ghost)";

                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <td
                            style={{
                              padding: "8px 10px",
                              fontSize: 12,
                              color: "var(--text-primary)",
                              fontStyle: "italic",
                            }}
                          >
                            {s.scientificName}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {s.commonName || "—"}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span
                              style={{
                                fontFamily:
                                  "var(--font-jetbrains, 'PT Mono', monospace)",
                                fontSize: 10,
                                padding: "2px 8px",
                                borderRadius: 4,
                                color: statusColor,
                                background: `${statusColor}18`,
                                border: `1px solid ${statusColor}40`,
                              }}
                            >
                              {s.conservationStatus}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              fontSize: 12,
                              color: "var(--text-ghost)",
                            }}
                          >
                            {s.lastSightingDate || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p
                style={{
                  fontSize: 10,
                  color: "var(--text-ghost)",
                  marginTop: 12,
                }}
              >
                Data: BioNet Atlas, NSW Department of Climate Change, Energy, the
                Environment and Water
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
