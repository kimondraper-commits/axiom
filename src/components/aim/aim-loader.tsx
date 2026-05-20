"use client";

import dynamic from "next/dynamic";

const AimFinder = dynamic(() => import("@/components/aim/aim-finder"), {
  ssr: false,
  loading: () => (
    <div
      className="flex-1 animate-pulse flex items-center justify-center"
      style={{ background: "var(--carbon, #0d1117)" }}
    >
      <span style={{ color: "var(--text-ghost, #6c7680)", fontSize: 13 }}>
        Loading AIM…
      </span>
    </div>
  ),
});

export function AimLoader() {
  return <AimFinder />;
}
