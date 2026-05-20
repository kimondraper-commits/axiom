"use client";

import dynamic from "next/dynamic";

const WorkbenchPanel = dynamic(
  () => import("@/components/workbench/workbench-panel"),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex-1 animate-pulse flex items-center justify-center"
        style={{ background: "var(--carbon, #0d1117)" }}
      >
        <span style={{ color: "var(--text-ghost, #6c7680)", fontSize: 13 }}>
          Loading Workbench…
        </span>
      </div>
    ),
  }
);

export function WorkbenchLoader() {
  return <WorkbenchPanel />;
}
