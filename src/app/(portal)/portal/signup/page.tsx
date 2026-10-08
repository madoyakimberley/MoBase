"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SIGNUP_STEPS = [
  {
    key: "fullName",
    label: "Full Name",
    sublabel: "Legal or workspace contact name",
    required: true,
  },
  {
    key: "email",
    label: "Work Email",
    sublabel: "Registered workspace domain",
    required: true,
  },
  {
    key: "username",
    label: "Choose Username",
    sublabel: "Unique handle for system authentication",
    required: true,
  },
  {
    key: "password",
    label: "Password",
    sublabel: "Encrypted token access key with strict criteria",
    required: true,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberWorkstation, setRememberWorkstation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const activeStep = SIGNUP_STEPS[currentStep];
  const isLastStep = currentStep === SIGNUP_STEPS.length - 1;

  // Generate 2-3 dynamic username suggestions based on full name & email
  const usernameSuggestions = useMemo(() => {
    const cleanName = fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "");
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const emailPrefix =
      email
        .split("@")[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "";

    const list: string[] = [];

    if (parts.length >= 2) {
      list.push(`${parts[0]}_${parts[parts.length - 1]}`);
      list.push(`${parts[0]}.${parts[parts.length - 1]}`);
    } else if (parts.length === 1) {
      list.push(`${parts[0]}_dev`);
      list.push(`${parts[0]}123`);
    }

    if (emailPrefix && !list.includes(emailPrefix)) {
      list.push(emailPrefix);
    }

    while (list.length < 3) {
      const base = parts[0] || emailPrefix || "user";
      const rand = Math.floor(100 + Math.random() * 899);
      const candidate = `${base}${rand}`;
      if (!list.includes(candidate)) {
        list.push(candidate);
      }
    }

    return list.slice(0, 3);
  }, [fullName, email]);

  // Password validation checks
  const isMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isMatching = password.length > 0 && password === confirmPassword;

  const isPasswordValid =
    isMinLength &&
    hasLower &&
    hasUpper &&
    hasNumber &&
    hasSpecial &&
    isMatching;

  const isCurrentStepValid = () => {
    if (!activeStep.required) return true;
    if (activeStep.key === "fullName") return fullName.trim().length > 0;
    if (activeStep.key === "email")
      return email.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email.trim());
    if (activeStep.key === "username")
      return /^[a-z0-9_.-]{3,30}$/i.test(username.trim());
    if (activeStep.key === "password") return isPasswordValid;
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isCurrentStepValid()) {
      if (activeStep.key === "email" && email.length > 0) {
        setError("Please enter a valid email address (e.g. user@domain.com).");
      } else if (activeStep.key === "username") {
        setError(
          "Username must be 3–30 characters long and contain only letters, numbers, underscores, or dots.",
        );
      } else if (activeStep.key === "password") {
        if (!isMinLength) {
          setError("Password must be at least 8 characters long.");
        } else if (!hasLower) {
          setError("Password must contain at least one lowercase letter.");
        } else if (!hasUpper) {
          setError("Password must contain at least one uppercase letter.");
        } else if (!hasNumber) {
          setError("Password must contain at least one number.");
        } else if (!hasSpecial) {
          setError("Password must contain at least one special character.");
        } else if (!isMatching) {
          setError("Passwords do not match.");
        }
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username: username.toLowerCase().trim(),
          password,
          fullName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
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
      setError(err.message || "An error occurred during account creation.");
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
              ACCOUNT REGISTRATION
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-normal tracking-tight mb-2">
              {activeStep.label}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-light max-w-xs mx-auto leading-relaxed">
              {activeStep.sublabel}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              <span>
                STEP 0{currentStep + 1} OF 0{SIGNUP_STEPS.length}
              </span>
              <span>{activeStep.label}</span>
            </div>

            <div className="w-full h-1 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-[var(--border-glass)]">
              <div
                className="h-full bg-[var(--accent-gold)] transition-all duration-300 ease-out"
                style={{
                  width: `${((currentStep + 1) / SIGNUP_STEPS.length) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-center gap-1.5 pt-1">
              {SIGNUP_STEPS.map((s, idx) => (
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
            {/* Step 1: Full Name */}
            {activeStep.key === "fullName" && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-[11px] text-[var(--text-secondary)] font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Amani Odhiambo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
              </div>
            )}

            {/* Step 2: Work Email */}
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
                    placeholder="client@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Username with 3 Suggestions */}
            {activeStep.key === "username" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-[var(--text-secondary)] font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-muted)] font-mono text-xs">
                      @
                    </span>
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. amani_odhiambo"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-8 pr-4 py-3.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Suggested Usernames */}
                <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl space-y-2">
                  <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                    Suggested Usernames:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setUsername(sug)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                          username === sug
                            ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] border-[var(--accent-gold)] font-medium"
                            : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--accent-gold)]"
                        }`}
                      >
                        @{sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Password */}
            {activeStep.key === "password" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-[var(--text-secondary)] font-medium">
                      Password
                    </label>
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
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Password Criteria */}
                <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl space-y-1.5 text-[11px]">
                  <p className="text-[var(--text-secondary)] font-medium mb-1 font-mono text-[10px]">
                    REQUIREMENTS:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                    <span
                      className={
                        isMinLength
                          ? "text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {isMinLength ? "✓" : "•"} Min. 8 chars
                    </span>
                    <span
                      className={
                        hasUpper
                          ? "text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {hasUpper ? "✓" : "•"} Uppercase
                    </span>
                    <span
                      className={
                        hasLower
                          ? "text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {hasLower ? "✓" : "•"} Lowercase
                    </span>
                    <span
                      className={
                        hasNumber
                          ? "text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {hasNumber ? "✓" : "•"} Number
                    </span>
                    <span
                      className={
                        hasSpecial
                          ? "text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {hasSpecial ? "✓" : "•"} Symbol
                    </span>
                    <span
                      className={
                        isMatching
                          ? "text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {isMatching ? "✓" : "•"} Passwords match
                    </span>
                  </div>
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
                disabled={loading || !isCurrentStepValid()}
                className="flex-1 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-mono font-medium tracking-wider uppercase text-xs rounded-xl py-3.5 px-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>
                  {loading
                    ? "CREATING ACCOUNT..."
                    : isLastStep
                      ? "CREATE ACCOUNT"
                      : "CONTINUE"}
                </span>
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/portal/login"
                className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] text-xs font-medium transition-colors"
              >
                Already registered? Sign In
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border-glass)] flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)] font-mono">
            <span>256-Bit Encrypted Session</span>
            <span>•</span>
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </main>
    </div>
  );
}
