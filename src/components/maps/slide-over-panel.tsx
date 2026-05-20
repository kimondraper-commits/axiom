"use client";

import { ReactNode } from "react";
import { IconClose } from "./icons";

interface SlideOverPanelProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

/**
 * Reusable slide-over panel that anchors to the left edge of the map
 * (next to the tool rail). Used for layers, drawing, measurement, etc.
 */
export function SlideOverPanel({
  open,
  title,
  onClose,
  children,
  width = 320,
}: SlideOverPanelProps) {
  if (!open) return null;
  return (
    <div
      className="absolute top-0 bottom-0 z-20 flex flex-col shadow-2xl"
      style={{
        left: 56,
        width,
        background: "var(--carbon, #0d1117)",
        borderRight: "1px solid var(--border, rgba(255,255,255,0.06))",
        animation: "slideOverIn 180ms ease-out",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,0.06))" }}
      >
        <h3
          style={{
            fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--gold, #00e87b)",
            fontWeight: 600,
          }}
        >
          {title}
        </h3>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-ghost, #6c7680)",
            cursor: "pointer",
            padding: 4,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary, #ffffff)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-ghost, #6c7680)")}
        >
          <IconClose size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      <style jsx>{`
        @keyframes slideOverIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
