"use client";

import { useState } from "react";
import Link from "next/link";
import SpotlightCard from "./spotlight-card";

interface SpotlightLinkProps {
  href: string;
  icon: string;
  label: string;
  desc: string;
}

export function SpotlightLink({ href, icon, label, desc }: SpotlightLinkProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      className="block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SpotlightCard
        className="rounded-xl p-5 h-full"
        spotlightColor="rgba(201,168,76,0.14)"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: hovered ? "1px solid var(--border-hover)" : "1px solid var(--border)",
          boxShadow: hovered ? "var(--shadow-hover)" : "var(--shadow-card)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition:
            "transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, border-color 0.22s ease",
        }}
      >
        {/* Icon badge */}
        <div
          className="text-xl mb-3 w-9 h-9 flex items-center justify-center rounded-lg"
          style={{
            background: hovered ? "rgba(201,168,76,0.18)" : "rgba(201,168,76,0.09)",
            transition: "background 0.2s ease",
          }}
        >
          {icon}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--text-primary)",
            marginBottom: 3,
          }}
        >
          {label}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 11,
            color: "var(--silver)",
            fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
            lineHeight: 1.4,
            marginBottom: 8,
          }}
        >
          {desc}
        </div>

        {/* Arrow link */}
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
            fontWeight: 600,
            color: "var(--gold)",
            display: "flex",
            alignItems: "center",
            gap: hovered ? 6 : 3,
            transition: "gap 0.2s ease",
          }}
        >
          Open <span>→</span>
        </div>
      </SpotlightCard>
    </Link>
  );
}
