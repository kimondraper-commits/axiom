"use client";

import CountUp from "@/components/ui/react-bits/count-up";

interface AnimatedStatCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  alert?: boolean;
  index?: number;  // for stagger delay
  trend?: number[]; // sparkline data points (optional, defaults to synthetic curve)
}

// Generates a smooth sparkline SVG path from an array of y-values
function SparklinePath({ data, color }: { data: number[]; color: string }) {
  const w = 80;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return [x, y] as [number, number];
  });

  // Cubic bezier path
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const cpx = px + step * 0.5;
    d += ` C ${cpx},${py} ${cx - step * 0.5},${cy} ${cx},${cy}`;
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      style={{ overflow: "visible" }}
    >
      {/* Fill area */}
      <defs>
        <linearGradient id={`spark-fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${points[points.length - 1][0]},${h} L 0,${h} Z`}
        fill={`url(#spark-fill-${color.replace("#", "")})`}
      />
      {/* Line */}
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

const DEFAULT_SPARKLINES = [
  [3, 5, 4, 7, 6, 9, 8, 11, 10, 12],
  [8, 6, 9, 7, 10, 8, 12, 10, 14, 13],
  [2, 4, 3, 5, 4, 6, 5, 7, 8, 9],
  [5, 3, 6, 4, 7, 5, 8, 6, 9, 8],
];

export function AnimatedStatCard({
  label,
  value,
  highlight,
  alert,
  index = 0,
  trend,
}: AnimatedStatCardProps) {
  const sparkData = trend ?? DEFAULT_SPARKLINES[index % DEFAULT_SPARKLINES.length];

  const borderColor = alert
    ? "rgba(220,38,38,0.25)"
    : highlight
      ? "var(--border-hover)"
      : "var(--border)";

  const valueColor = alert
    ? "var(--status-error)"
    : highlight
      ? "var(--gold-dim)"
      : "var(--text-primary)";

  const sparkColor = alert
    ? "#DC2626"
    : highlight
      ? "#C9A84C"
      : "#34D399";

  const trendUp = sparkData[sparkData.length - 1] >= sparkData[0];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: "20px 22px",
        boxShadow: "var(--shadow-card)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        animationName: "fadeUp",
        animationDuration: "0.5s",
        animationTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        animationFillMode: "both",
        animationDelay: `${index * 80}ms`,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-hover)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)";
        (e.currentTarget as HTMLDivElement).style.borderColor = borderColor;
      }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--silver-dark)",
          marginBottom: 10,
        }}
      >
        {label}
      </p>

      {/* Value + Sparkline row */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <p
          style={{
            fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)",
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1,
            color: valueColor,
            letterSpacing: "-0.02em",
          }}
        >
          <CountUp to={value} from={0} duration={2} separator="," />
        </p>
        <div style={{ paddingBottom: 2 }}>
          <SparklinePath data={sparkData} color={sparkColor} />
        </div>
      </div>

      {/* Trend indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 8,
          fontSize: 11,
          fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
          fontWeight: 500,
          color: trendUp ? "var(--green-dark)" : "var(--status-error)",
        }}
      >
        <span>{trendUp ? "↑" : "↓"}</span>
        <span style={{ color: "var(--silver)", fontWeight: 400 }}>vs last month</span>
      </div>
    </div>
  );
}
