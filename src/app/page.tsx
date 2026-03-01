"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoNav, LogoPrimary } from "@/components/ui/logo";

type Phase = "photo" | "transitioning" | "blueprint";

const SKYLINE_PATH = `
  M 0,535
  L 55,530 L 110,522 L 155,510 L 195,492 L 225,474 L 255,460
  L 275,450 L 295,442 L 318,436 L 338,428 L 355,432 L 368,418
  L 382,408 L 400,400 L 418,394 L 436,388 L 450,392 L 462,382
  L 476,374 L 492,368 L 510,360 L 528,352 L 545,344 L 558,336
  L 570,328 L 582,320 L 598,310 L 612,298 L 622,286
  L 630,260 L 638,225 L 644,195 L 649,178 L 652,170
  L 655,165 L 658,170 L 661,178 L 664,195 L 668,225
  L 673,260 L 680,286 L 690,298 L 705,308 L 720,315
  L 738,320 L 755,316 L 772,320 L 788,314 L 805,308
  L 822,302 L 840,308 L 858,312 L 878,316 L 900,322
  L 922,330 L 945,338 L 968,346 L 992,355 L 1018,364
  L 1048,374 L 1080,386 L 1115,402 L 1148,420 L 1180,440
  L 1210,460 L 1245,478 L 1280,496 L 1320,510 L 1370,520
  L 1440,528
  L 1440,810 L 0,810 Z
`;

export default function WelcomePage() {
  const [phase, setPhase] = useState<Phase>("photo");
  const [showText, setShowText] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowText(true), 700),
      setTimeout(() => { setPhase("transitioning"); setAnimating(true); }, 3500),
      setTimeout(() => setPhase("blueprint"), 7500),
      setTimeout(() => setShowCTA(true), 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const isBlueprint = phase === "blueprint";
  const isTransitioning = phase !== "photo";

  return (
    <>
      {/* ════════════════════════════════════════════════
          SECTION 1 — Animated intro (full viewport)
      ════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: "100svh" }}>

        {/* Photo */}
        <div className="absolute inset-0">
          <img
            src="/sydney-harbour.jpg"
            alt="Sydney Harbour"
            className="w-full h-full object-cover object-center"
            style={{
              animation: animating ? "toBlueprint 4.2s cubic-bezier(0.4,0,0.2,1) forwards" : undefined,
              filter: animating ? undefined : "brightness(0.84) contrast(1.1) saturate(1.08)",
              transform: phase === "photo" ? "scale(1.055)" : "scale(1.0)",
              transition: "transform 4s ease-in-out",
              transformOrigin: "center 55%",
            }}
          />
        </div>

        {/* Blueprint SVG overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: "opacity 2.5s cubic-bezier(0.4,0,0.2,1)",
            transitionDelay: isTransitioning ? "0.8s" : "0s",
          }}
        >
          <svg viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <defs>
              <pattern id="grid-sm" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0L0 0 0 32" fill="none" stroke="rgba(200,164,78,0.08)" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid-lg" width="160" height="160" patternUnits="userSpaceOnUse">
                <path d="M160 0L0 0 0 160" fill="none" stroke="rgba(200,164,78,0.15)" strokeWidth="1" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="strong-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="1440" height="810" fill="url(#grid-sm)" opacity="0.85" />
            <rect width="1440" height="810" fill="url(#grid-lg)" opacity="0.6" />
            <path
              d={SKYLINE_PATH} fill="none" stroke="#c8a44e" strokeWidth="1.8"
              strokeLinejoin="round" filter="url(#glow)"
              style={{ strokeDasharray: 4200, strokeDashoffset: isBlueprint ? 0 : 4200, transition: "stroke-dashoffset 3.5s cubic-bezier(0.4,0,0.2,1)", transitionDelay: "0.4s" }}
            />
            <path d={SKYLINE_PATH} fill="#08080c" opacity={isBlueprint ? 0.28 : 0} style={{ transition: "opacity 2.5s ease", transitionDelay: "1s" }} />
            <line x1="0" y1="537" x2="1440" y2="537" stroke="#8a7235" strokeWidth="1.2" strokeDasharray="10,7" filter="url(#glow)" style={{ opacity: isBlueprint ? 0.8 : 0, transition: "opacity 1.5s ease", transitionDelay: "1.8s" }} />
            <text x="18" y="528" fill="#8a7235" fontSize="9" fontFamily="monospace" style={{ opacity: isBlueprint ? 1 : 0, transition: "opacity 1.5s ease", transitionDelay: "2s" }}>WATERLINE · PORT JACKSON</text>
            <g style={{ opacity: isBlueprint ? 1 : 0, transition: "opacity 1.5s ease", transitionDelay: "2.2s" }}>
              <line x1="656" y1="165" x2="656" y2="537" stroke="#c8a44e" strokeWidth="0.8" strokeDasharray="3,6" filter="url(#glow)" opacity="0.55" />
              <circle cx="656" cy="163" r="5" fill="none" stroke="#c8a44e" strokeWidth="1.5" filter="url(#glow)" />
              <line x1="661" y1="158" x2="760" y2="138" stroke="#8a7235" strokeWidth="0.8" />
              <text x="763" y="136" fill="#dbb85e" fontSize="9" fontFamily="monospace">SYDNEY TOWER EYE · 309m AHD</text>
            </g>
            <g style={{ opacity: isBlueprint ? 1 : 0, transition: "opacity 1.5s ease", transitionDelay: "2.4s" }}>
              <circle cx="700" cy="566" r="9" fill="none" stroke="#8a7235" strokeWidth="1.2" filter="url(#glow)" />
              <line x1="709" y1="560" x2="754" y2="542" stroke="#8a7235" strokeWidth="0.8" />
              <text x="757" y="540" fill="#c8a44e" fontSize="8" fontFamily="monospace">FORT DENISON · EST. 1857</text>
            </g>
            <text x="300" y="660" fill="#8a7235" fontSize="15" fontFamily="monospace" textAnchor="middle" letterSpacing="6" style={{ opacity: isBlueprint ? 0.9 : 0, transition: "opacity 2s ease", transitionDelay: "2s" }}>PORT JACKSON</text>
            <text x="720" y="450" fill="#c8a44e" fontSize="20" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="8" filter="url(#strong-glow)" style={{ opacity: isBlueprint ? 0.75 : 0, transition: "opacity 2s ease", transitionDelay: "2.2s" }}>SYDNEY CBD</text>
            <text x="18" y="18" fill="rgba(200,164,78,0.3)" fontSize="8" fontFamily="monospace" style={{ opacity: isBlueprint ? 1 : 0, transition: "opacity 1s ease", transitionDelay: "2s" }}>33°51′54″S  151°12′34″E</text>
            <text x="18" y="800" fill="rgba(200,164,78,0.3)" fontSize="8" fontFamily="monospace" style={{ opacity: isBlueprint ? 1 : 0, transition: "opacity 1s ease", transitionDelay: "2s" }}>SYDNEY HARBOUR · NSW AUSTRALIA · SCALE 1:25 000 · AXIOM</text>
            <text x="1422" y="800" fill="rgba(200,164,78,0.3)" fontSize="8" fontFamily="monospace" textAnchor="end" style={{ opacity: isBlueprint ? 1 : 0, transition: "opacity 1s ease", transitionDelay: "2s" }}>SHEET 1 OF 1 · REV A</text>
            <g transform="translate(1390,88)" style={{ opacity: isBlueprint ? 1 : 0, transition: "opacity 1.5s ease", transitionDelay: "2.4s" }}>
              <circle cx="0" cy="0" r="24" fill="none" stroke="rgba(200,164,78,0.2)" strokeWidth="1" />
              <circle cx="0" cy="0" r="3" fill="rgba(200,164,78,0.3)" />
              <polygon points="0,-22 -5,-8 0,-4 5,-8" fill="#c8a44e" filter="url(#glow)" />
              <polygon points="0,22 -5,8 0,4 5,8" fill="rgba(200,164,78,0.3)" />
              <polygon points="-22,0 -8,-5 -4,0 -8,5" fill="rgba(200,164,78,0.3)" />
              <polygon points="22,0 8,-5 4,0 8,5" fill="rgba(200,164,78,0.3)" />
              <text x="0" y="-29" fill="#c8a44e" fontSize="11" fontFamily="monospace" textAnchor="middle" filter="url(#glow)">N</text>
              <text x="0" y="38" fill="rgba(200,164,78,0.3)" fontSize="9" fontFamily="monospace" textAnchor="middle">S</text>
              <text x="-34" y="4" fill="rgba(200,164,78,0.3)" fontSize="9" fontFamily="monospace" textAnchor="middle">W</text>
              <text x="34" y="4" fill="rgba(200,164,78,0.3)" fontSize="9" fontFamily="monospace" textAnchor="middle">E</text>
            </g>
          </svg>
        </div>

        {/* Scan line */}
        {phase === "transitioning" && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div style={{ position: "absolute", left: 0, right: 0, height: "280px", background: "linear-gradient(180deg, transparent 0%, rgba(200,164,78,0.04) 20%, rgba(200,164,78,0.10) 50%, rgba(200,164,78,0.04) 80%, transparent 100%)", animation: "scanDown 4s cubic-bezier(0.4,0,0.6,1) forwards" }} />
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0" style={{ background: isBlueprint ? "linear-gradient(to top, rgba(8,8,12,0.88) 0%, rgba(8,8,12,0.55) 40%, rgba(8,8,12,0.2) 100%)" : "linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.06) 100%)", transition: "background 4s cubic-bezier(0.4,0,0.2,1)" }} />

        {/* Welcome text */}
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-16 text-center px-8"
          style={{ opacity: showText ? 1 : 0, transition: "opacity 1.6s ease" }}
        >
          {isBlueprint ? (
            <div className="mb-6">
              <LogoNav />
            </div>
          ) : (
            <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", color: "var(--gold-dim)" }}>
              Sydney NSW, Australia · 33°51′S 151°12′E
            </p>
          )}
          <h1 className="text-6xl sm:text-7xl font-bold drop-shadow-2xl leading-tight" style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", color: "var(--text-primary)" }}>Welcome,</h1>
          <h1 className="text-6xl sm:text-7xl font-bold drop-shadow-2xl leading-tight mb-5" style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", color: "var(--gold)", transition: "color 3.5s ease" }}>
            Kimon.
          </h1>
          <p className="text-lg mb-8 max-w-sm" style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 300, color: "var(--text-secondary)", transition: "color 3s ease" }}>
            {isBlueprint ? "Your city planning workspace is ready." : "Initialising AXIOM\u2026"}
          </p>

          {/* CTA row */}
          <div className="flex items-center gap-4" style={{ opacity: showCTA ? 1 : 0, transform: showCTA ? "translateY(0)" : "translateY(14px)", transition: "opacity 1.2s ease, transform 1.2s ease" }}>
            <Link
              href="/overview"
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-base transition-all"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
                color: "var(--void)",
                boxShadow: "0 0 48px rgba(200,164,78,0.25)",
                fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              Enter AXIOM
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <a href="#about" className="text-sm transition-colors underline underline-offset-4" style={{ color: "var(--text-ghost)" }}>
              Learn more \u2193
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1"
          style={{ opacity: showCTA ? 0.5 : 0, transition: "opacity 1.5s ease" }}
        >
          <span style={{ fontSize: 10, fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-ghost)" }}>scroll</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--text-ghost)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SECTION 2 — Platform overview (scrollable)
      ════════════════════════════════════════════════ */}
      <div id="about" style={{ background: "var(--void)" }}>

        {/* Nav */}
        <header className="sticky top-0 z-40" style={{ background: "var(--carbon)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <LogoNav />
            <Link
              href="/overview"
              className="px-4 py-2 rounded-md text-sm transition-colors"
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600 }}
            >
              Open Platform
            </Link>
          </div>
        </header>

        {/* Hero text */}
        <section style={{ background: "var(--carbon)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
            {/* Primary logo hero mark */}
            <div className="mb-10 overflow-hidden" style={{ background: "var(--void)", borderRadius: 16, padding: "32px 40px", border: "1px solid var(--border)" }}>
              <LogoPrimary />
            </div>
            <span
              className="text-xs font-semibold uppercase px-3 py-1 rounded-full mb-6"
              style={{
                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                letterSpacing: 2,
                color: "var(--gold-dim)",
                border: "1px solid var(--border-active)",
                background: "var(--gold-glow)",
              }}
            >
              Government Planning Platform
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl mb-6" style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", color: "var(--text-primary)" }}>
              Modern tools for city planners and government staff
            </h2>
            <p className="text-lg max-w-xl mb-10" style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 300, color: "var(--text-secondary)" }}>
              Interactive GIS maps, AI planning assistance, data analytics, and project
              collaboration — all in one secure platform built for municipal government.
            </p>
            <div className="flex gap-3">
              <Link
                href="/overview"
                className="px-6 py-3 rounded-md transition-colors"
                style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600 }}
              >
                Access your workspace
              </Link>
              <a
                href="#features"
                className="px-6 py-3 rounded-md transition-colors"
                style={{ background: "var(--graphite)", color: "var(--text-primary)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 500 }}
              >
                See features
              </a>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{ background: "var(--carbon)" }}>
          <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "GIS Maps", label: "Interactive zoning & parcel data" },
              { value: "AI-Powered", label: "Urban planner assistant" },
              { value: "Real-time", label: "Team collaboration" },
              { value: "WCAG 2.1 AA", label: "Accessibility compliant" },
            ].map((s) => (
              <div key={s.value}>
                <div className="text-xl font-bold mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}>{s.value}</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20" style={{ background: "var(--void)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", color: "var(--text-primary)" }}>Four core tools</h2>
              <p className="max-w-lg mx-auto" style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", color: "var(--text-secondary)" }}>
                Everything a planning department needs, integrated into a single workspace.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
                  title: "Interactive GIS Maps", tag: "Mapbox GL",
                  desc: "View zoning districts, parcel boundaries, and city layers on an interactive map. Click any parcel to instantly pull property data. Toggle layers, switch basemaps, and measure distances.",
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
                  title: "AI Planning Assistant", tag: "Claude AI",
                  desc: "Ask any question about zoning codes, EP&A Act, traffic studies, or planning best practices. The AI assistant is trained on urban planning expertise and can be scoped to a specific project.",
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                  title: "Data Analytics", tag: "Recharts",
                  desc: "City-wide dashboards covering building permits, zoning changes, population trends, and capital projects. Filter by date range and district. Export data to CSV for reports.",
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
                  title: "Project Collaboration", tag: "Real-time",
                  desc: "Manage planning projects from initiation to closeout. Upload documents, track team members, and run threaded comment threads — including a moderated public comment portal.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl p-6 flex gap-5"
                  style={{ background: "var(--carbon)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--gold-glow)", color: "var(--gold)" }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", color: "var(--text-primary)" }}>{f.title}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ color: "var(--text-secondary)", background: "var(--graphite)" }}
                      >
                        {f.tag}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", color: "var(--text-secondary)" }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="py-20" style={{ background: "var(--carbon)", borderTop: "1px solid var(--border)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", color: "var(--text-primary)" }}>Built for government teams</h2>
              <p style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", color: "var(--text-secondary)" }}>Role-based access keeps the right people in the right seats.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { role: "Admin", badgeStyle: { background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)" } as React.CSSProperties, perms: ["Manage users and roles", "Create and archive projects", "Configure GIS layers", "Moderate public comments", "Full read/write access"] },
                { role: "Planner", badgeStyle: { background: "var(--graphite)", color: "var(--text-primary)" } as React.CSSProperties, perms: ["Create and edit projects", "Upload documents", "Use AI assistant", "Post and reply to comments", "View all analytics"] },
                { role: "Viewer", badgeStyle: { background: "var(--steel)", color: "var(--text-secondary)" } as React.CSSProperties, perms: ["Read-only project access", "View GIS maps and layers", "Browse analytics dashboards", "View approved comments", "Use AI assistant"] },
              ].map((r) => (
                <div
                  key={r.role}
                  className="rounded-xl p-6"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div
                    className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                    style={r.badgeStyle}
                  >
                    {r.role}
                  </div>
                  <ul className="space-y-2">
                    {r.perms.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--gold)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16" style={{ background: "linear-gradient(135deg, var(--carbon) 0%, var(--slate) 100%)" }}>
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", color: "var(--gold)" }}>Ready to get started?</h2>
            <p className="mb-8" style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", color: "var(--text-secondary)" }}>Jump straight into the platform — no sign-in required to explore.</p>
            <Link
              href="/overview"
              className="inline-block px-8 py-3 rounded-md transition-colors"
              style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 600, letterSpacing: 1 }}
            >
              Enter AXIOM
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: "var(--void)", borderTop: "1px solid var(--border)", color: "var(--text-ghost)" }} className="py-8">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <LogoNav />
            <span style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 11, letterSpacing: 1 }}>Planning Platform · WCAG 2.1 AA · Built for government</span>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes toBlueprint {
          0%   { filter: brightness(0.84) contrast(1.10) saturate(1.08); }
          12%  { filter: brightness(0.80) contrast(1.14) saturate(0.82); }
          25%  { filter: brightness(0.74) contrast(1.22) saturate(0.52) sepia(0.15) hue-rotate(80deg); }
          40%  { filter: brightness(0.66) contrast(1.36) saturate(0.28) sepia(0.42) hue-rotate(140deg); }
          55%  { filter: brightness(0.58) contrast(1.52) saturate(0.16) sepia(0.65) hue-rotate(168deg); }
          70%  { filter: brightness(0.52) contrast(1.68) saturate(0.09) sepia(0.82) hue-rotate(182deg); }
          85%  { filter: brightness(0.48) contrast(1.80) saturate(0.05) sepia(0.92) hue-rotate(190deg); }
          100% { filter: brightness(0.46) contrast(1.88) saturate(0.04) sepia(0.96) hue-rotate(193deg); }
        }
        @keyframes scanDown {
          0%   { top: -280px; }
          100% { top: 100vh; }
        }
      `}</style>
    </>
  );
}
