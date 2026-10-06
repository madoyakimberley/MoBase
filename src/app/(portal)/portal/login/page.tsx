"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPortal() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberWorkstation, setRememberWorkstation] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload =
      mode === "login"
        ? { email, password, searchCode }
        : { email, password, fullName, companyName, searchCode };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (data.role === "SUPER_ADMIN" || data.role === "DEVELOPER") {
        router.push("/admin/dashboard");
      } else {
        router.push(
          `/portal/workspace${data.projectId ? `?project=${data.projectId}` : ""}`,
        );
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between p-6 sm:p-10 selection:bg-[var(--accent-gold)] selection:text-[var(--bg-canvas)]">
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
          <span className="font-medium text-[var(--text-primary)]">
            MOBASE STUDIO
          </span>
          <span className="text-[var(--accent-gold)]">//</span>
          <span className="text-[var(--accent-gold)]">SECURE PORTAL</span>
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

      {/* Main Gateway Center */}
      <main className="w-full max-w-lg mx-auto my-12 relative">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle Accent Light Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-gold)] opacity-5 blur-3xl pointer-events-none" />

          {/* M Logo Badge */}
          <div className="w-12 h-12 mx-auto mb-6 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-center text-[var(--accent-gold)] font-serif text-2xl font-normal shadow-inner">
            M
          </div>

          {/* Subheading & Title */}
          <div className="text-center mb-8">
            <p className="text-[10px] font-mono tracking-[0.25em] text-[var(--accent-gold)] uppercase mb-2 font-medium">
              PRIVATE ARCHITECTURAL GATEWAY
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight mb-2">
              {mode === "login" ? "Portal Access" : "Create Workspace"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-light max-w-xs mx-auto leading-relaxed">
              {mode === "login"
                ? "Enter your project ID and email to view your build progress."
                : "Establish your corporate workspace and secure project portal."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-red-400 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <>
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
              </>
            )}

            {/* Email Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Work Email
                </label>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Registered Domain
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-muted)]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  placeholder="client@atelier-design.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Password
                </label>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Encrypted Token
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-muted)]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
              </div>
            </div>

            {/* Project ID / Search Code Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Project ID{" "}
                  <span className="text-[var(--text-muted)] font-normal">
                    (Optional)
                  </span>
                </label>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Identifier Format: MB-XXXX
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-muted)]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="MB-9421-LUX"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] uppercase font-mono tracking-wider focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[var(--text-muted)]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Checkbox and Account Redirect Link */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <input
                  type="checkbox"
                  checked={rememberWorkstation}
                  onChange={(e) => setRememberWorkstation(e.target.checked)}
                  className="rounded border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--accent-gold)] focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember workstation</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                }}
                className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] text-xs font-medium transition-colors text-left sm:text-right cursor-pointer"
              >
                {mode === "login"
                  ? "Don't have an account? Create Workspace"
                  : "Already registered? Sign In"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-mono font-medium tracking-wider uppercase text-xs rounded-xl py-3.5 px-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <span>
                {loading
                  ? "AUTHENTICATING..."
                  : mode === "login"
                    ? "ACCESS PROJECT TRACKER"
                    : "ESTABLISH WORKSPACE"}
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

          {/* Sub Footer Certification */}
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

        {/* Card Sub-metadata */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono px-2">
          <span>
            Instance{" "}
            <strong className="text-[var(--text-secondary)] font-normal">
              PROD-NY4
            </strong>
          </span>
          <div className="flex items-center gap-3">
            <span className="hover:text-[var(--text-secondary)] cursor-pointer">
              Client Security
            </span>
            <span>•</span>
            <span className="hover:text-[var(--text-secondary)] cursor-pointer">
              Privacy Policy
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Feature Highlights */}
      <footer className="w-full max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-[var(--accent-gold)]">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium text-[var(--text-primary)] mb-1">
                Real-time Milestones
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Track architectural stages, sprint throughput, and bespoke
                artisan handoffs live.
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-[var(--accent-gold)]">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium text-[var(--text-primary)] mb-1">
                Asset Approvals
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Review 3D architectural renders, typography proofs, and physical
                materials.
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-[var(--accent-gold)]">
              <svg
                className="w-4 h-4"
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
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium text-[var(--text-primary)] mb-1">
                Single Sign-On SSO
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                Enterprise Okta and Azure AD directory hooks pre-configured per
                corporate workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--text-muted)] font-mono border-t border-[var(--border-glass)] pt-6 gap-4">
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
        </div>
      </footer>
    </div>
  );
}
