"use client";

import {
  Sparkles,
  MapPin,
  Tag,
  Lock,
  Check,
  Copy,
  MessageSquare,
  Bookmark,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Lead } from "./types";

interface LeadCardProps {
  lead: Lead;
  copiedId: string | null;
  onStartChat: (lead: Lead) => void;
  onToggleClaim: (lead: Lead) => void;
  onCopyPhone: (id: string, text: string) => void;
  onDismissLead: (id: string) => void;
}

export function LeadCard({
  lead,
  copiedId,
  onStartChat,
  onToggleClaim,
  onCopyPhone,
  onDismissLead,
}: LeadCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md relative">
      <div className="space-y-4">
        {/* Badges Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" /> NO WEBSITE
            </span>

            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${
                lead.status === "CLAIMED"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : lead.status === "CONTACTED"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border-[var(--border-glass)]"
              }`}
            >
              {lead.status}
            </span>
          </div>

          <span className="font-mono text-xs text-[var(--text-secondary)]">
            ★ {lead.rating} ({lead.reviewCount})
          </span>
        </div>

        {/* Business Metadata */}
        <div className="space-y-1">
          <h2 className="font-serif text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
            {lead.name}
          </h2>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-muted)]">
            {lead.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[var(--accent-gold)]" />
                {lead.city}
              </span>
            )}
            {lead.niche && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-[var(--text-muted)]" />
                {lead.niche}
              </span>
            )}
          </div>
        </div>

        {/* Contact Info Box */}
        <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-[11px]">
              Masked Phone:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--accent-gold)] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {lead.maskedPhone}
              </span>
              <button
                onClick={() => onCopyPhone(lead.id, lead.maskedPhone)}
                title="Copy Contact Info"
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {copiedId === lead.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-5 mt-5 border-t border-[var(--border-glass)] space-y-2">
        <button
          onClick={() => onStartChat(lead)}
          className="w-full py-2.5 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] text-xs font-mono font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>
            {lead.status === "CONTACTED"
              ? "Continue Proxy Chat"
              : "Start Proxy Chat"}
          </span>
        </button>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => onToggleClaim(lead)}
            title={lead.status === "CLAIMED" ? "Unclaim Lead" : "Claim Lead"}
            className={`py-2 px-2 border rounded-xl text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer ${
              lead.status === "CLAIMED"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lead.status === "CLAIMED" ? "Claimed" : "Claim"}</span>
          </button>

          {lead.mapsUrl ? (
            <a
              href={lead.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="View location on Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Maps</span>
            </a>
          ) : (
            <button
              disabled
              className="py-2 px-2 bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--text-muted)] rounded-xl text-[11px] font-mono opacity-50 flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Maps</span>
            </button>
          )}

          <button
            onClick={() => onDismissLead(lead.id)}
            title="Dismiss card from current view"
            className="py-2 px-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-red-500/50 text-[var(--text-muted)] hover:text-red-400 rounded-xl text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
}
