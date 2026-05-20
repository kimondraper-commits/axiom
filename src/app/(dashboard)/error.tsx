"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div
        className="text-center max-w-md p-8 rounded-xl"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}
        >
          <span style={{ color: "#DC2626", fontSize: 20 }}>!</span>
        </div>
        <h2
          className="text-lg mb-2"
          style={{ fontFamily: "var(--font-open-sans, sans-serif)", fontWeight: 600, color: "var(--text-primary)" }}
        >
          Something went wrong
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          An unexpected error occurred. This has been logged for review.
          {error.digest && (
            <span className="block mt-2" style={{ fontFamily: "var(--font-pt-mono, monospace)", fontSize: 11, color: "var(--text-ghost)" }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
            color: "#fff",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
