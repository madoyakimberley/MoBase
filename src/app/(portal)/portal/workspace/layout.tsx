"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DevUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

// Only these roles may see the developer workspace.
const ALLOWED_ROLES = ["DEVELOPER", "SUPER_ADMIN"];

const BASE = "/portal/workspace";

const navTabs = [
  { label: "Overview", href: BASE },
  { label: "Find Jobs", href: `${BASE}/find-jobs` },
  { label: "Active Jobs", href: `${BASE}/active-jobs` },
  { label: "Clients", href: `${BASE}/clients` },
  { label: "History", href: `${BASE}/history` },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [devUser, setDevUser] = useState<DevUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Verify the session. Any failure sends the user to login (fails closed).
  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/portal/login");
          return;
        }
        const data = await res.json();
        if (!data?.user || !ALLOWED_ROLES.includes(data.user.role)) {
          router.replace("/portal/login");
          return;
        }
        if (!cancelled) setDevUser(data.user);
      } catch {
        router.replace("/portal/login");
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/portal/login");
      router.refresh();
    }
  };

  // Don't render any workspace content (or fire its API calls) until verified.
  if (!devUser) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-300">
      <header className="w-full border-b border-[var(--border-glass)] bg-[var(--bg-surface)] px-6 py-3.5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <Link href={BASE} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-gold)] text-[var(--bg-canvas)] flex items-center justify-center font-serif font-bold text-sm">
              M
            </div>
            <span className="font-mono text-xs tracking-widest font-semibold uppercase text-[var(--text-primary)]">
              MoBase{" "}
              <span className="text-[var(--text-muted)] font-normal">
                // Dev Console
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <div className="w-6 h-6 rounded-full bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-mono text-[11px] font-bold flex items-center justify-center">
                {devUser.fullName?.slice(0, 1).toUpperCase() || "D"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-medium leading-none text-[var(--text-primary)]">
                  {devUser.fullName}
                </span>
                <span className="text-[9px] font-mono text-[var(--accent-gold)] uppercase leading-tight">
                  {devUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <nav className="w-full border-b border-[var(--border-glass)] bg-[var(--bg-surface)] px-6">
        <div className="max-w-[1600px] mx-auto flex items-center space-x-1 overflow-x-auto">
          {navTabs.map((tab) => {
            const isActive =
              tab.href === BASE
                ? pathname === BASE
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`py-3.5 px-4 text-xs font-mono tracking-wider transition-all duration-150 border-b-2 whitespace-nowrap ${
                  isActive
                    ? "border-[var(--accent-gold)] text-[var(--accent-gold)] font-semibold"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
