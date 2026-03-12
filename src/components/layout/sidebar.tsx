"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { SessionUser } from "@/lib/auth";
import { LogoNav } from "@/components/ui/logo";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: "⊞" },
  { href: "/maps", label: "GIS Maps", icon: "⬫" },
  { href: "/analytics", label: "Analytics", icon: "▦" },
  { href: "/projects", label: "Projects", icon: "⟰" },
  { href: "/assistant", label: "AI Assistant", icon: "◈" },
  { href: "/calculators", label: "Calculators", icon: "∑" },
  { href: "/readiness", label: "Readiness", icon: "◉" },
  { href: "/community-impact", label: "Community Impact", icon: "⊕" },
  { href: "/climate-risk", label: "Climate Risk", icon: "⚠" },
  { href: "/live-das", label: "Live DAs", icon: "◫" },
  { href: "/subsurface", label: "Subsurface", icon: "▽" },
  { href: "/acquisitions", label: "Acquisitions", icon: "⊡" },
  { href: "/biodiversity", label: "Biodiversity", icon: "❋" },
  { href: "/submissions", label: "Submissions", icon: "✉" },
  { href: "/import", label: "Import Data", icon: "↑" },
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-full"
      style={{
        background: "var(--bg-primary)",
        borderRight: "1px solid var(--border)",
        boxShadow: "var(--shadow-sidebar)",
      }}
    >
      {/* Brand */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <LogoNav />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200"
              style={{
                fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.01em",
                borderLeft: `3px solid ${isActive ? "var(--gold)" : "transparent"}`,
                background: isActive
                  ? "linear-gradient(90deg, rgba(201,168,76,0.08) 0%, transparent 100%)"
                  : "transparent",
                color: isActive ? "var(--gold-dim)" : "var(--silver-dark)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--silver-dark)";
                }
              }}
            >
              <span
                className="w-5 h-5 flex items-center justify-center text-sm shrink-0 rounded"
                style={{
                  background: isActive ? "rgba(201,168,76,0.12)" : "transparent",
                  color: isActive ? "var(--gold)" : "var(--silver)",
                  transition: "all 0.2s ease",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 flex items-center justify-center text-xs shrink-0 rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
              color: "#fff",
              fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)",
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 2px 6px rgba(201,168,76,0.30)",
            }}
          >
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-medium truncate"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {user.name ?? user.email}
            </div>
            <div
              className="truncate uppercase"
              style={{
                fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                fontSize: 9,
                letterSpacing: 2,
                color: "var(--silver)",
              }}
            >
              {user.role}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left text-xs px-1 transition-colors duration-200"
          style={{
            color: "var(--silver)",
            fontFamily: "var(--font-dm, 'Open Sans', sans-serif)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--silver)";
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
