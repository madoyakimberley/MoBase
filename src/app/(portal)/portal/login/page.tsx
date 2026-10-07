"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LOGIN_STEPS = [
  {
    key: "email",
    label: "Work Email",
    sublabel: "Registered enterprise domain",
    required: true,
  },
  {
    key: "password",
    label: "Password",
    sublabel: "Encrypted token key",
    required: true,
  },
  {
    key: "searchCode",
    label: "Project ID",
    sublabel: "Identifier Format: MB-XXXX (Optional)",
    required: false,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberWorkstation, setRememberWorkstation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchCode, setSearchCode] = useState("");

  const activeStep = LOGIN_STEPS[currentStep];
  const isLastStep = currentStep === LOGIN_STEPS.length - 1;

  const isCurrentStepValid = () => {
    if (!activeStep.required) return true;
    if (activeStep.key === "email")
      return email.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email.trim());
    if (activeStep.key === "password") return password.length >= 8;
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isCurrentStepValid()) {
      if (activeStep.key === "email" && email.length > 0) {
        setError("Please enter a valid email address (e.g. user@domain.com).");
      } else if (activeStep.key === "password" && password.length < 8) {
        setError("Password must be at least 8 characters in length.");
      } else {
        setError(
          `Please enter a valid ${activeStep.label.toLowerCase()} before continuing.`,
        );
      }
      return;
    }

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          searchCode,
          rememberWorkstation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (data.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push(
          `/portal/workspace${data.projectId ? `?project=${data.projectId}` : ""}`,
        );
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between p-6 sm:p-10 selection:bg-[var(--accent-gold)] selection:text-[var(--bg-canvas)]">
      {/* Header */}
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

      {/* Main Form */}
      <main className="w-full max-w-lg mx-auto my-12 relative">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-gold)] opacity-5 blur-3xl pointer-events-none" />

          <div className="w-12 h-12 mx-auto mb-6 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-center text-[var(--accent-gold)] font-serif text-2xl font-normal shadow-inner">
            M
          </div>

          <div className="text-center mb-6">
            <p className="text-[10px] font-mono tracking-[0.25em] text-[var(--accent-gold)] uppercase mb-2 font-medium">
              PORTAL AUTHENTICATION
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-normal tracking-tight mb-2">
              {activeStep.label}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-light max-w-xs mx-auto leading-relaxed">
              {activeStep.sublabel}
            </p>
          </div>

          {/* Progress Bar & Dots */}
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              <span>
                STEP 0{currentStep + 1} OF 0{LOGIN_STEPS.length}
              </span>
              <span>{activeStep.label}</span>
            </div>

            <div className="w-full h-1 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-[var(--border-glass)]">
              <div
                className="h-full bg-[var(--accent-gold)] transition-all duration-300 ease-out"
                style={{
                  width: `${((currentStep + 1) / LOGIN_STEPS.length) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-center gap-1.5 pt-1">
              {LOGIN_STEPS.map((s, idx) => (
                <div
                  key={s.key}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentStep === idx
                      ? "w-6 bg-[var(--accent-gold)]"
                      : idx < currentStep
                        ? "w-1.5 bg-[var(--accent-gold)] opacity-50"
                        : "w-1.5 bg-[var(--border-subtle)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[var(--bg-surface-elevated)] border border-red-500/30 text-red-400 text-xs rounded-xl text-center font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleNext} className="space-y-6">
            {activeStep.key === "email" && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
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
                    autoFocus
                    required
                    placeholder="client@atelier-design.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  />
                </div>
              </div>
            )}

            {activeStep.key === "password" && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
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
                    type={showPassword ? "text" : "password"}
                    autoFocus
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 012.122-.363c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeStep.key === "searchCode" && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Project ID{" "}
                    <span className="text-[var(--text-muted)] font-normal">
                      (Optional)
                    </span>
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Identifier: MB-XXXX
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
                    autoFocus
                    placeholder="MB-9421-LUX"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="w-full pl-10 pr-10 py-3.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] uppercase font-mono tracking-wider focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  />
                </div>
              </div>
            )}

            {isLastStep && (
              <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberWorkstation}
                    onChange={(e) => setRememberWorkstation(e.target.checked)}
                    className="rounded border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--accent-gold)] focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Remember workstation token</span>
                </label>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="px-4 py-3.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-mono rounded-xl transition-colors cursor-pointer"
                >
                  BACK
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-mono font-medium tracking-wider uppercase text-xs rounded-xl py-3.5 px-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {loading
                    ? "AUTHENTICATING..."
                    : isLastStep
                      ? "ACCESS PROJECT TRACKER"
                      : "CONTINUE"}
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
            </div>

            <div className="text-center pt-2">
              <Link
                href="/portal/signup"
                className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] text-xs font-medium transition-colors"
              >
                Don't have an account? Create Workspace
              </Link>
            </div>
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

      {/* Footer Features */}
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
