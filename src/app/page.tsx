import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MoBaseHomepage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-300">
      {/* 1. Main Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-canvas)]/80 border-b border-[var(--border-glass)] px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--accent-gold)] flex items-center justify-center text-[var(--bg-canvas)] font-bold text-xs">
            M
          </div>
          <span className="font-serif text-lg tracking-wider font-semibold">
            MoBase{" "}
            <span className="text-[10px] tracking-widest text-[var(--text-muted)] uppercase font-sans ml-1">
              Studio
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/signup"
            className="px-5 py-2 rounded-full border border-[var(--border-subtle)] text-xs font-semibold tracking-wider text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-all"
          >
            Get Started
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* 2. Value Proposition Sub-Bar */}
      <div className="px-6 md:px-16 py-3 border-b border-[var(--border-glass)] flex flex-wrap items-center justify-between text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <span className="text-[var(--accent-gold)]">
            ● High-Velocity Development Platform
          </span>
          <span className="hidden md:inline text-[var(--border-subtle)]">
            |
          </span>
          <span className="hidden md:inline">
            Sub-Second Edge Infrastructure & Automated Workflows
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[var(--accent-gold)] font-bold">
            Flat KES 20,000 Tier
          </span>
          <span>Instant Deployment</span>
        </div>
      </div>

      <main className="px-6 md:px-16 py-12 max-w-[1440px] mx-auto space-y-16">
        {/* 3. Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-gold)]">
              Developer-First Platform · Nairobi / Global
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight">
              Architectural Engine Built for{" "}
              <span className="font-serif italic text-[var(--accent-gold)] font-normal">
                Sub-Second Performance
              </span>
            </h1>
          </div>
          <div className="lg:col-span-4 pb-2 space-y-4">
            <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
              MoBase provides developers and studios with an ultra-fast Next.js
              foundation, pre-configured edge architecture, and high-conversion
              UX patterns.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/portal/signup"
                className="px-6 py-3 rounded-full bg-[var(--accent-gold)] text-[var(--bg-canvas)] text-xs font-bold tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <span>Get Started</span>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-full border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold tracking-wider hover:border-[var(--accent-gold)] transition-all"
              >
                Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Showcase & Platform Features */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Developer Architecture Preview */}
          <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[480px] relative overflow-hidden group hover:border-[var(--border-subtle)] transition-all">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] z-10">
              <span className="px-3 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)]">
                ● Edge Infrastructure
              </span>
              <span className="text-lg font-serif italic text-[var(--text-secondary)]">
                01
              </span>
            </div>

            {/* Terminal / Code Visual Frame */}
            <div className="my-8 rounded-xl bg-[#0b0a09] border border-[var(--border-glass)] h-64 flex flex-col justify-between p-5 font-mono text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  mobase.config.ts
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-zinc-300">
                <p className="text-[var(--accent-gold)]">
                  export default defineConfig(&#123;
                </p>
                <p className="pl-4">
                  runtime:{" "}
                  <span className="text-amber-200/80">&quot;edge&quot;</span>,
                </p>
                <p className="pl-4">
                  optimization: &#123; latencyTarget:{" "}
                  <span className="text-amber-200/80">
                    &quot;&lt;800ms&quot;
                  </span>{" "}
                  &#125;,
                </p>
                <p className="pl-4">
                  integrations: [
                  <span className="text-amber-200/80">
                    &quot;whatsapp-native&quot;
                  </span>
                  ,{" "}
                  <span className="text-amber-200/80">
                    &quot;next-themes&quot;
                  </span>
                  ]
                </p>
                <p>&#125;);</p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-white/5">
                <span>STATUS: READY</span>
                <span className="text-[var(--accent-gold)]">BUILD: 0.12s</span>
              </div>
            </div>

            <div className="flex items-end justify-between z-10">
              <div>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-gold)] block mb-1">
                  Developer Stack
                </span>
                <h3 className="text-xl font-serif text-[var(--text-primary)]">
                  Modular Edge Framework
                </h3>
              </div>
              <Link
                href="/docs"
                className="px-4 py-2 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-all flex items-center gap-2"
              >
                <span>Read Specs</span>
                <svg
                  className="w-3.5 h-3.5 fill-current text-[var(--accent-gold)]"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Key Tenets */}
          <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] mb-6">
              <span className="text-[var(--text-primary)]">
                Core Capabilities
              </span>
              <span>Architecture</span>
            </div>

            <div className="space-y-6 my-auto">
              <div className="space-y-1 border-b border-[var(--border-glass)] pb-4">
                <h4 className="text-base font-serif flex items-center gap-2">
                  <span className="text-[var(--accent-gold)] font-sans text-xs font-semibold">
                    01
                  </span>
                  Edge Runtime Deployment
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-6">
                  Next.js App Router pre-configured for instant global edge
                  execution with zero bundle bloat.
                </p>
              </div>

              <div className="space-y-1 border-b border-[var(--border-glass)] pb-4">
                <h4 className="text-base font-serif flex items-center gap-2">
                  <span className="text-[var(--accent-gold)] font-sans text-xs font-semibold">
                    02
                  </span>
                  Japandi Design System
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-6">
                  Pre-configured CSS variable theme layer supporting flawless
                  Light and Dark mode transitions.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-serif flex items-center gap-2">
                  <span className="text-[var(--accent-gold)] font-sans text-xs font-semibold">
                    03
                  </span>
                  Fixed Tier Pricing
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-6">
                  Full production starter license and setup available at KES
                  20,000 flat rate.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 mt-4">
              <Link
                href="/portal/signup"
                className="flex-1 text-center py-3 rounded-full bg-[var(--accent-gold)] text-[var(--bg-canvas)] text-xs font-bold tracking-wider hover:opacity-90 transition-opacity"
              >
                Get Started (KES 20,000)
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Metrics Strip */}
        <section className="bg-[var(--bg-surface)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-gold)] block">
              Execution Time
            </span>
            <div className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">
              &lt; 0.8<span className="text-xl font-sans">s</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Sub-second edge rendering
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-gold)] block">
              Build Velocity
            </span>
            <div className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">
              100<span className="text-xl font-sans">%</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Type-safe Next.js stack
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-gold)] block">
              Starter Package
            </span>
            <div className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">
              KES 20k
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Fixed license fee
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-gold)] block">
              Setup Duration
            </span>
            <div className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">
              5 <span className="text-xl font-sans">Days</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Turnkey delivery</p>
          </div>
        </section>
      </main>
    </div>
  );
}
