"use client";

import { useState, useMemo } from "react";

const CRITERIA = [
  {
    key: "scope",
    label: "Scope Definition",
    weight: 0.2,
    options: [
      { label: "None", score: 0 },
      { label: "Draft", score: 25 },
      { label: "Reviewed", score: 70 },
      { label: "Approved", score: 100 },
    ],
  },
  {
    key: "design",
    label: "Design Maturity",
    weight: 0.15,
    options: [
      { label: "None", score: 0 },
      { label: "Concept", score: 25 },
      { label: "Preliminary", score: 60 },
      { label: "Detailed", score: 100 },
    ],
  },
  {
    key: "cost",
    label: "Cost Estimate Confidence",
    weight: 0.2,
    options: [
      { label: "None", score: 0 },
      { label: "Rough Order", score: 20 },
      { label: "Preliminary", score: 60 },
      { label: "Detailed", score: 100 },
    ],
  },
  {
    key: "delivery",
    label: "Delivery Strategy",
    weight: 0.1,
    options: [
      { label: "Not Defined", score: 0 },
      { label: "Under Review", score: 50 },
      { label: "Confirmed", score: 100 },
    ],
  },
  {
    key: "bcr",
    label: "Business Case / BCR",
    weight: 0.15,
    options: [
      { label: "Not Started", score: 0 },
      { label: "In Progress", score: 40 },
      { label: "Complete", score: 100 },
    ],
  },
  {
    key: "risk",
    label: "Risk Assessment",
    weight: 0.1,
    options: [
      { label: "Not Started", score: 0 },
      { label: "Draft", score: 40 },
      { label: "Complete", score: 100 },
    ],
  },
  {
    key: "community",
    label: "Community Readiness",
    weight: 0.1,
    options: [
      { label: "No Engagement", score: 0 },
      { label: "Early Engagement", score: 50 },
      { label: "Formal Process Underway", score: 100 },
    ],
  },
] as const;

type Selections = Record<string, number>;

function getTrafficLight(score: number) {
  if (score >= 70) return { color: "#059669", label: "Project Ready to Proceed" };
  if (score >= 40) return { color: "#D97706", label: "Significant Gaps Remain" };
  return { color: "#DC2626", label: "Not Ready for Announcement" };
}

function CircularGauge({ score }: { score: number }) {
  const { color, label } = getTrafficLight(score);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={200} height={200} viewBox="0 0 200 200">
        <circle
          cx={100}
          cy={100}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={12}
        />
        <circle
          cx={100}
          cy={100}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
        <text
          x={100}
          y={92}
          textAnchor="middle"
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontWeight: 700,
            fontSize: 36,
            fill: color,
          }}
        >
          {Math.round(score)}%
        </text>
        <text
          x={100}
          y={118}
          textAnchor="middle"
          style={{
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            fontSize: 9,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            fill: "var(--text-ghost)",
          }}
        >
          READINESS SCORE
        </text>
      </svg>
      <div
        className="px-4 py-2 rounded-lg text-center text-sm font-semibold"
        style={{
          background: `${color}18`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function CriteriaBar({
  label,
  weight,
  score,
}: {
  label: string;
  weight: number;
  score: number;
}) {
  const { color } = getTrafficLight(score);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span
          style={{
            fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
            fontSize: 13,
            color: "var(--text-primary)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            fontSize: 11,
            color: "var(--text-ghost)",
          }}
        >
          {score}% · {Math.round(weight * 100)}% weight
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: color,
            transition: "width 0.4s ease, background 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export function ReadinessScorecard() {
  const [selections, setSelections] = useState<Selections>(() =>
    Object.fromEntries(CRITERIA.map((c) => [c.key, 0]))
  );

  const { totalScore, breakdown } = useMemo(() => {
    let total = 0;
    const breakdown = CRITERIA.map((c) => {
      const score = selections[c.key] ?? 0;
      total += score * c.weight;
      return { key: c.key, label: c.label, weight: c.weight, score };
    });
    return { totalScore: total, breakdown };
  }, [selections]);

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
    fontWeight: 400,
    fontSize: 12,
    color: "var(--text-secondary)",
    marginBottom: 4,
  };

  return (
    <div className="flex gap-6">
      {/* Inputs */}
      <div className="w-2/5 space-y-4">
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: 16,
            }}
          >
            Assessment Criteria
          </p>
          <div className="space-y-4">
            {CRITERIA.map((c) => (
              <div key={c.key}>
                <label style={labelStyle}>
                  {c.label}{" "}
                  <span style={{ color: "var(--text-ghost)", fontSize: 11 }}>
                    ({Math.round(c.weight * 100)}%)
                  </span>
                </label>
                <select
                  value={selections[c.key]}
                  onChange={(e) =>
                    setSelections((prev) => ({
                      ...prev,
                      [c.key]: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                >
                  {c.options.map((opt) => (
                    <option key={opt.label} value={opt.score}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-4">
        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 24,
          }}
          className="flex justify-center"
        >
          <CircularGauge score={totalScore} />
        </div>

        <div
          style={{
            background: "var(--carbon)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: 16,
            }}
          >
            Criteria Breakdown
          </p>
          <div className="space-y-3">
            {breakdown.map((b) => (
              <CriteriaBar
                key={b.key}
                label={b.label}
                weight={b.weight}
                score={b.score}
              />
            ))}
          </div>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "var(--text-ghost)",
            textAlign: "center",
          }}
        >
          Methodology based on NSW Infrastructure Investor Assurance Framework
        </p>
      </div>
    </div>
  );
}
