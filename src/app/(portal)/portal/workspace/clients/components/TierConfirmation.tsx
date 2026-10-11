"use client";

import { Sparkles, Bot, ShieldCheck } from "lucide-react";

/**
 * TODO: VESPER ENGINE INTEGRATION
 * Reserved for Vesper AI automated tier evaluation.
 */
export function TierConfirmation() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 opacity-90">
      <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-3">
        <div className="flex items-center gap-2 text-[var(--accent-gold)]">
          <Bot className="w-4 h-4" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            Vesper AI Tier Gate — Reserved Module
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20">
          Auto Audit Active
        </span>
      </div>

      <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
        Vesper AI continuously audits the client’s spatial blueprints, review
        trust score, and feature requirements to auto-assign Tier 1 ($20,000),
        Tier 2 ($27,500), or Tier 3 ($35,000) settlement structures.
      </p>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
        <span>Legal framework verified under Kenya Evidence Act Sec 106B</span>
      </div>
    </div>
  );
}
