interface StatCardProps {
  label: string;
  value: number | string;
  highlight?: boolean;
  alert?: boolean;
}

export function StatCard({ label, value, highlight, alert }: StatCardProps) {
  const borderColor = alert
    ? "rgba(196,90,78,0.3)"
    : highlight
    ? "var(--border-active)"
    : "var(--border)";

  const valueColor = alert
    ? "var(--status-error)"
    : highlight
    ? "var(--gold)"
    : "var(--text-primary)";

  return (
    <div
      style={{
        background: "var(--carbon)",
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        padding: "16px 20px",
        transition: "border-color 0.3s ease",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--gold-dim)",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
          fontWeight: 600,
          fontSize: 28,
          color: valueColor,
        }}
      >
        {value}
      </p>
    </div>
  );
}
