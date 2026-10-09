import React from "react";

export function JobCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 animate-pulse shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 bg-[var(--bg-surface-elevated)] rounded-md" />
          <div className="h-5 w-16 bg-[var(--bg-surface-elevated)] rounded-md" />
        </div>
        <div className="h-4 w-16 bg-[var(--bg-surface-elevated)] rounded" />
      </div>

      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-[var(--bg-surface-elevated)] rounded-lg" />
        <div className="flex items-center gap-3">
          <div className="h-3.5 w-20 bg-[var(--bg-surface-elevated)] rounded" />
          <div className="h-3.5 w-24 bg-[var(--bg-surface-elevated)] rounded" />
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-[var(--bg-surface-elevated)] rounded" />
          <div className="h-4 w-28 bg-[var(--bg-surface-elevated)] rounded" />
        </div>
      </div>

      <div className="pt-5 border-t border-[var(--border-glass)] space-y-2">
        <div className="h-10 w-full bg-[var(--bg-surface-elevated)] rounded-xl" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="h-8 bg-[var(--bg-surface-elevated)] rounded-xl" />
          <div className="h-8 bg-[var(--bg-surface-elevated)] rounded-xl" />
          <div className="h-8 bg-[var(--bg-surface-elevated)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function JobCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="h-4 w-56 bg-[var(--bg-surface)] rounded animate-pulse" />
        <div className="h-4 w-32 bg-[var(--bg-surface)] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function LoginStepSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2 text-center">
        <div className="h-3 w-36 mx-auto bg-[var(--bg-surface-elevated)] rounded" />
        <div className="h-8 w-48 mx-auto bg-[var(--bg-surface-elevated)] rounded-lg" />
        <div className="h-3.5 w-64 mx-auto bg-[var(--bg-surface-elevated)] rounded" />
      </div>
      <div className="h-12 w-full bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-glass)]" />
      <div className="h-12 w-full bg-[var(--bg-surface-elevated)] rounded-xl" />
    </div>
  );
}
