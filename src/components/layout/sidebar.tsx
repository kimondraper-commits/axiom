"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { SessionUser } from "@/lib/auth";
import { LogoNav } from "@/components/ui/logo";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: "\u229E" },
  { href: "/maps", label: "GIS Maps", icon: "\u25EB" },
  { href: "/analytics", label: "Analytics", icon: "\u25A6" },
  { href: "/projects", label: "Projects", icon: "\u25F0" },
  { href: "/assistant", label: "AI Assistant", icon: "\u25C8" },
  { href: "/calculators", label: "Calculators", icon: "\u2211" },
  { href: "/import", label: "Import Data", icon: "\u2191" },
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-full"
      style={{ background: "var(--carbon)", borderRight: "1px solid var(--border)" }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <LogoNav />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-[13px] transition-all"
              style={{
                fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "0.5px",
                borderLeft: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                background: isActive ? "linear-gradient(90deg, rgba(200,164,78,0.1), transparent)" : undefined,
                color: isActive ? "var(--gold)" : "var(--text-ghost)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(200,164,78,0.04)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-ghost)";
                }
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 flex items-center justify-center text-xs shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
              borderRadius: 4,
              color: "var(--void)",
              fontFamily: "var(--font-syne, 'Syne', sans-serif)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-medium truncate"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 500, fontSize: 12 }}
            >
              {user.name ?? user.email}
            </div>
            <div
              className="truncate uppercase"
              style={{
                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                fontSize: 9,
                letterSpacing: 2,
                color: "var(--gold-dim)",
              }}
            >
              {user.role}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left text-xs px-1 transition-colors"
          style={{ color: "var(--text-ghost)", fontFamily: "var(--font-outfit, 'Outfit', sans-serif)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-ghost)"; }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
