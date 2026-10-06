"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchCode, setSearchCode] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          companyName,
          email,
          password,
          searchCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create workspace.");
      }

      router.push(
        `/portal/workspace${data.projectId ? `?project=${data.projectId}` : ""}`,
      );
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between p-6 sm:p-10 selection:bg-[var(--accent-gold)] selection:text-[var(--bg-canvas)]">
      <header className="w-full flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
          <span className="font-medium text-[var(--text-primary)]">
            MOBASE STUDIO
          </span>
          <span className="text-[var(--accent-gold)]">//</span>
          <span className="text-[var(--accent-gold)]">NEW WORKSPACE</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] tracking-wider font-mono">
          <svg
            className="w-3.5 h-3.5 text-[var(--accent-gold)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-[var(--text-secondary)]">
            256-BIT ENCRYPTED
          </span>
        </div>
      </header>

      <main className="w-full max-w-lg mx-auto my-12 relative">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="w-12 h-12 mx-auto mb-6 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-center text-[var(--accent-gold)] font-serif text-2xl font-normal shadow-inner">
            M
          </div>

          <div className="text-center mb-8">
            <p className="text-[10px] font-mono tracking-[0.25em] text-[var(--accent-gold)] uppercase mb-2 font-medium">
              ESTABLISH CORPORATE WORKSPACE
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight mb-2">
              Create Workspace
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-light max-w-xs mx-auto leading-relaxed">
              Register your brand and establish an encrypted project portal.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-red-400 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] font-medium mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amani Odhiambo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] font-medium mb-1.5">
                Brand / Company Workspace Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Atelier Design Co."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] font-medium mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="client@atelier-design.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-secondary)] font-medium mb-1.5">
                Existing Job Code{" "}
                <span className="text-[var(--text-muted)] font-normal">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                placeholder="MB-9421-LUX"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] uppercase font-mono tracking-wider focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>

            <div className="flex items-center justify-end text-xs pt-1">
              <Link
                href="/portal/login"
                className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] text-xs font-medium transition-colors"
              >
                Already have an account? Sign In
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-mono font-medium tracking-wider uppercase text-xs rounded-xl py-3.5 px-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <span>
                {loading ? "CREATING WORKSPACE..." : "ESTABLISH WORKSPACE"}
              </span>
              {!loading && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border-glass)] flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)] font-mono">
            <svg
              className="w-3.5 h-3.5 text-[var(--accent-gold)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>256-Bit Encrypted Session</span>
            <span>•</span>
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--text-muted)] font-mono border-t border-[var(--border-glass)] pt-6 gap-4">
        <div>
          Powered by{" "}
          <strong className="text-[var(--text-secondary)] font-medium">
            MoBase
          </strong>{" "}
          Architectural Systems
        </div>
        <div className="flex items-center gap-4">
          <span>SOC-2 Certified</span>
          <span>|</span>
          <span>ISO 27001</span>
          <span>|</span>
          <span>Privacy Shield</span>
        </div>
      </footer>
    </div>
  );
}
