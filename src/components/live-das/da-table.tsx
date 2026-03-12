"use client";

import { useState, useCallback } from "react";

interface DaRecord {
  applicationId: string;
  applicationType: string;
  developmentType: string;
  status: string;
  council: string;
  address: string;
}

const STATUS_COLORS: Record<string, string> = {
  Determined: "#059669",
  "Under Assessment": "#D97706",
  "On Exhibition": "#3B82F6",
  "Additional Information Requested": "#8B5CF6",
  Lodged: "#6B7280",
  Withdrawn: "#DC2626",
  Rejected: "#DC2626",
  Pending: "#D97706",
};

const COUNCILS = [
  "Parramatta",
  "Sydney",
  "Blacktown",
  "Liverpool",
  "Penrith",
  "Canterbury-Bankstown",
  "Cumberland",
  "The Hills Shire",
  "Central Coast",
  "Northern Beaches",
  "Inner West",
  "Wollongong",
  "Newcastle",
  "Bayside",
  "Ryde",
];

const cardLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--gold-dim)",
  marginBottom: 12,
};

export function DaTable() {
  const [council, setCouncil] = useState("Parramatta");
  const [das, setDas] = useState<DaRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/data-sources/nsw-eplanning?council=${encodeURIComponent(council)}&pageSize=20`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setDas(json.data ?? []);
      setTotalCount(json.meta?.totalCount ?? 0);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setDas([]);
    } finally {
      setLoading(false);
    }
  }, [council]);

  const inputLabelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
    fontWeight: 400,
    fontSize: 12,
    color: "var(--text-secondary)",
    marginBottom: 4,
  };

  return (
    <div className="space-y-4">
      {/* Search controls */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Search Development Applications</p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label style={inputLabelStyle}>Council / LGA</label>
            <select
              value={council}
              onChange={(e) => setCouncil(e.target.value)}
              className="w-full"
            >
              {COUNCILS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
            {loading ? "Searching..." : "Search"}
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

      {/* Results */}
      {searched && !error && (
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p style={cardLabelStyle}>
              Results — {council}
            </p>
            <span
              style={{
                fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                fontSize: 11,
                color: "var(--text-ghost)",
              }}
            >
              {totalCount.toLocaleString()} total DAs
            </span>
          </div>

          {das.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-ghost)" }}>
              No development applications found.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["DA Number", "Address", "Type", "Status", "Council"].map(
                      (h) => (
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
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {das.map((da) => {
                    const statusColor =
                      Object.entries(STATUS_COLORS).find(([k]) =>
                        da.status.toLowerCase().includes(k.toLowerCase())
                      )?.[1] ?? "var(--text-ghost)";

                    return (
                      <tr
                        key={da.applicationId}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: 12,
                            color: "var(--gold)",
                            fontFamily:
                              "var(--font-jetbrains, 'PT Mono', monospace)",
                            fontWeight: 500,
                          }}
                        >
                          {da.applicationId}
                        </td>
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: 12,
                            color: "var(--text-primary)",
                            maxWidth: 250,
                          }}
                        >
                          <span className="truncate block">
                            {da.address || "—"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: 12,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {da.developmentType || da.applicationType || "—"}
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <span
                            style={{
                              fontFamily:
                                "var(--font-jetbrains, 'PT Mono', monospace)",
                              fontSize: 10,
                              letterSpacing: 1,
                              padding: "2px 8px",
                              borderRadius: 4,
                              color: statusColor,
                              background: `${statusColor}18`,
                              border: `1px solid ${statusColor}40`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {da.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: 12,
                            color: "var(--text-ghost)",
                          }}
                        >
                          {da.council}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p
            style={{
              fontSize: 10,
              color: "var(--text-ghost)",
              marginTop: 12,
            }}
          >
            Source: NSW Planning Portal DAApplicationTracker API
          </p>
        </div>
      )}
    </div>
  );
}
