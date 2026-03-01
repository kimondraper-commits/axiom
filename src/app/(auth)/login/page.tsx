"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/overview";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--void)" }}
    >
      <div
        className="w-full max-w-sm rounded-lg p-8"
        style={{ background: "var(--carbon)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
      >
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3"
            style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))" }}
          >
            <svg width="28" height="28" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <polygon points="60,4 116,60 60,116 4,60" fill="none" stroke="rgba(8,8,12,0.9)" strokeWidth="1.5"/>
              <polygon points="60,20 100,60 60,100 20,60" fill="none" stroke="rgba(8,8,12,0.7)" strokeWidth="1" opacity="0.6"/>
              <line x1="60" y1="4" x2="60" y2="116" stroke="rgba(8,8,12,0.5)" strokeWidth="0.5" opacity="0.3"/>
              <line x1="4" y1="60" x2="116" y2="60" stroke="rgba(8,8,12,0.5)" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="60" cy="60" r="22" fill="none" stroke="rgba(8,8,12,0.7)" strokeWidth="0.8" opacity="0.4"/>
              <circle cx="60" cy="60" r="6" fill="rgba(8,8,12,0.9)"/>
            </svg>
          </div>
          <h1
            className="text-xl"
            style={{
              fontFamily: "var(--font-syne, 'Syne', sans-serif)",
              fontWeight: 700,
              letterSpacing: 5,
              color: "var(--text-primary)",
              textTransform: "uppercase",
            }}
          >
            AXIOM
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Sign in to your planning workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)" }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder="you@cityagency.gov"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-md" style={{ color: "var(--status-error)", background: "rgba(196,90,78,0.1)", border: "1px solid rgba(196,90,78,0.2)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
              color: "var(--void)",
              fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
              fontWeight: 600,
              letterSpacing: 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, var(--gold), var(--gold-light))";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-gold)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, var(--gold-dim), var(--gold))";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
            }}
          >
            {loading ? "Signing in\u2026" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: "var(--text-ghost)" }}>
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}
