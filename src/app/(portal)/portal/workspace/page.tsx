"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BASE = "/portal/workspace";

interface Overview {
  money: { pipelineKes: number; inProgressKes: number; deliveredKes: number };
  actions: {
    signoffsPending: number;
    inReview: number;
    depositsPending: number;
  };
  counts: {
    active: number;
    prospects: number;
    clients: number;
    delivered: number;
  };
  activeBuilds: Array<{
    id: string;
    title: string;
    searchCode: string;
    status: string;
    clientName: string;
    brandName: string;
  }>;
  leads: Array<{
    id: string;
    title: string;
    status: string;
    totalPriceKes: number;
  }>;
}

const kes = (v: number) => `KES ${v.toLocaleString("en-KE")}`;
const label = (s: string) => s.replace(/_/g, " ").toLowerCase();

export default function OverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dev/overview");
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/portal/login";
          return;
        }
        if (!res.ok) throw new Error("Could not load your overview.");
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-24 flex justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl text-center space-y-4">
        <p className="text-sm text-red-400">
          {error ?? "Could not load your overview."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-mono rounded-xl cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  const { money, actions, counts } = data;

  const moneyCards = [
    {
      title: "Pipeline",
      value: money.pipelineKes,
      note: `${counts.prospects} prospects`,
    },
    {
      title: "In progress",
      value: money.inProgressKes,
      note: `${counts.active} active builds`,
    },
    {
      title: "Delivered",
      value: money.deliveredKes,
      note: `${counts.delivered} projects`,
    },
  ];

  const actionItems = [
    {
      label: "Milestones awaiting sign-off",
      value: actions.signoffsPending,
      href: `${BASE}/active-jobs`,
    },
    {
      label: "Projects in client review",
      value: actions.inReview,
      href: `${BASE}/active-jobs`,
    },
    {
      label: "Deposits not yet paid",
      value: actions.depositsPending,
      href: `${BASE}/active-jobs`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-glass)] pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Your pipeline, your builds, and what needs you today.
          </p>
        </div>
        <Link
          href={`${BASE}/find-jobs`}
          className="px-4 py-2.5 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] text-xs font-mono font-medium rounded-xl transition-colors"
        >
          Find jobs
        </Link>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {moneyCards.map((c) => (
          <div
            key={c.title}
            className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2"
          >
            <span className="text-[11px] font-mono text-[var(--text-muted)] block">
              {c.title}
            </span>
            <span className="font-serif text-2xl block">{kes(c.value)}</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {c.note}
            </span>
          </div>
        ))}
      </section>

      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-xl">Action required</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {actionItems.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] hover:border-[var(--accent-gold)] transition-colors"
            >
              <span
                className={`font-serif text-2xl block ${
                  a.value > 0
                    ? "text-[var(--accent-gold)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {a.value}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {a.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
            <h2 className="font-serif text-xl">Active builds</h2>
            <Link
              href={`${BASE}/active-jobs`}
              className="text-xs font-mono text-[var(--accent-gold)] hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          {data.activeBuilds.length === 0 ? (
            <p className="py-10 text-center text-xs text-[var(--text-muted)]">
              No builds in progress yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.activeBuilds.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base">{b.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-[var(--bg-canvas)] text-[var(--accent-gold)] rounded-md border border-[var(--border-subtle)]">
                        {b.searchCode}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      <span className="font-medium text-[var(--text-primary)]">
                        {b.brandName}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {" "}
                        &bull;{" "}
                        {b.clientName === "No client assigned" ? (
                          <span className="italic opacity-80">
                            No client assigned
                          </span>
                        ) : (
                          b.clientName
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-[11px] font-mono rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {label(b.status)}
                    </span>
                    <Link
                      href={`${BASE}/active-jobs?id=${b.id}`}
                      className="px-3 py-1.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-mono rounded-lg hover:border-[var(--accent-gold)] transition-colors"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
            <h2 className="font-serif text-xl">Open leads</h2>
            <Link
              href={`${BASE}/find-jobs`}
              className="text-xs font-mono text-[var(--accent-gold)] hover:underline"
            >
              Explore &rarr;
            </Link>
          </div>

          {data.leads.length === 0 ? (
            <p className="py-10 text-center text-xs text-[var(--text-muted)]">
              No open leads yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.leads.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-sm">{l.title}</h3>
                    <span className="text-xs font-mono text-[var(--accent-gold)] shrink-0">
                      {kes(l.totalPriceKes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>{label(l.status)}</span>
                    <Link
                      href={`${BASE}/find-jobs?jobId=${l.id}`}
                      className="text-[var(--text-primary)] hover:text-[var(--accent-gold)] underline"
                    >
                      Claim
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
