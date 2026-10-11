"use client";

import { useState } from "react";
import {
  Lock,
  Send,
  Download,
  Paperclip,
  Shield,
  CheckCheck,
} from "lucide-react";
import { Lead } from "../../find-jobs/components/types";

interface ChatWallProps {
  activeLead: Lead;
  onOpenChat: (lead: Lead) => void;
}

export function ChatWall({ activeLead, onOpenChat }: ChatWallProps) {
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
            Client Chat Wall • Direct Principal Dispatch
          </h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
          <Lock className="w-3 h-3" /> ENCRYPTED SESSION ACTIVE
        </span>
      </div>

      {/* Message Stream */}
      <div className="space-y-4">
        {/* Message Bubble 1 - Client */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] font-bold flex items-center justify-center text-xs">
                AV
              </div>
              <span className="font-bold text-[var(--text-primary)]">
                Alistair Vartanian
              </span>
              <span>CEO MAISON VARTANIAN</span>
            </div>
            <span>10:42 AM</span>
          </div>

          <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed pl-9">
            The photogrammetry renders for the Geneva salon look extraordinary.
            However, our treasury is requesting the updated VAT breakdown before
            releasing the milestone tranche of $185,000.
          </p>

          <div className="text-[10px] font-mono text-[var(--text-muted)] pl-9">
            Delivered via Vartanian Family Office Vault Channel
          </div>
        </div>

        {/* Message Bubble 2 - Partner Gold Highlighting */}
        <div className="p-4 rounded-2xl bg-[var(--accent-gold)] text-[var(--bg-canvas)] space-y-3 shadow-md">
          <div className="flex items-center justify-between font-mono text-xs opacity-90">
            <span>11:15 AM</span>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider">
                PARTNER MOBASE ATELIER
              </span>
              <span className="font-semibold">Eleonora Castiglione</span>
              <div className="w-7 h-7 rounded-lg bg-[var(--bg-canvas)] text-[var(--accent-gold)] font-bold flex items-center justify-center text-xs">
                EC
              </div>
            </div>
          </div>

          <p className="text-xs font-sans font-medium leading-relaxed">
            We have attached the updated Swiss Federal Tax Administration VAT
            annex below. The cryptographic receipt has been pushed to your
            portal escrow.
          </p>

          {/* Attachment Pill */}
          <div className="p-3 rounded-xl bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-glass)] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5 truncate">
              <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] shrink-0">
                📄
              </div>
              <div className="truncate">
                <span className="font-bold block truncate">
                  MoBase-Inv-2025-098_VAT_Annotated.pdf
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  2.4 MB • SHA-256 Verified
                </span>
              </div>
            </div>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Composer */}
      <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-3">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={`Post a secure transmission to ${activeLead.name} executive wall...`}
          rows={3}
          className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-glass)] text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Attach Document / CAD</span>
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Private Atelier Note</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline-flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> End-to-End
              Encrypted
            </span>
            <button
              type="button"
              onClick={() => onOpenChat(activeLead)}
              className="px-4 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span>Post to Client Wall</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
