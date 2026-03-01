// ── AXIOM Diamond Reticle SVG mark ────────────────────────────────
function DiamondSVG({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Outer diamond */}
      <polygon points="60,4 116,60 60,116 4,60" fill="none" stroke="#c8a44e" strokeWidth="1.5" />
      {/* Inner diamond */}
      <polygon points="60,20 100,60 60,100 20,60" fill="none" stroke="#dbb85e" strokeWidth="1" opacity="0.6" />
      {/* Crosshairs */}
      <line x1="60" y1="4" x2="60" y2="116" stroke="#c8a44e" strokeWidth="0.5" opacity="0.3" />
      <line x1="4" y1="60" x2="116" y2="60" stroke="#c8a44e" strokeWidth="0.5" opacity="0.3" />
      {/* Inner ring */}
      <circle cx="60" cy="60" r="22" fill="none" stroke="#dbb85e" strokeWidth="0.8" opacity="0.4" />
      {/* Core */}
      <circle cx="60" cy="60" r="6" fill="#c8a44e" />
    </svg>
  );
}

// ── LogoNav: inline brand mark for sidebar & navbars ──────────
export function LogoNav({
  light,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <DiamondSVG size={28} />
      <span style={{
        fontFamily: 'var(--font-syne, "Syne", sans-serif)',
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 5,
        textTransform: "uppercase",
        color: "var(--text-primary)",
      }}>
        AXIOM
      </span>
    </div>
  );
}

// ── LogoCompact: alias for LogoNav (backwards compatibility) ──
export function LogoCompact({ light, className }: { light?: boolean; className?: string }) {
  return <LogoNav light={light} className={className} />;
}

// ── LogoPrimary: full hero logo ───────────────────────────────
export function LogoPrimary({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
    >
      <DiamondSVG size={90} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{
          fontFamily: 'var(--font-syne, "Syne", sans-serif)',
          fontWeight: 800,
          fontSize: 76,
          letterSpacing: 6,
          color: "var(--text-primary, #f0ece4)",
          textTransform: "uppercase",
          lineHeight: 1,
        }}>
          AXIOM
        </div>
        <div style={{
          fontFamily: 'var(--font-jetbrains, "JetBrains Mono", monospace)',
          fontSize: 11,
          letterSpacing: 4,
          color: "var(--gold-dim, #8a7235)",
          textTransform: "uppercase",
        }}>
          GOVERNMENT PLANNING PLATFORM
        </div>
      </div>
    </div>
  );
}
