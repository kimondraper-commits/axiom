export default function AimLoading() {
  return (
    <div
      className="flex h-full items-center justify-center animate-pulse"
      style={{ background: "var(--carbon, #0d1117)" }}
    >
      <span style={{ color: "var(--text-ghost, #6c7680)", fontSize: 13 }}>
        Loading AIM Site Finder…
      </span>
    </div>
  );
}
