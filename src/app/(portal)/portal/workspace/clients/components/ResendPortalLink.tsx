"use client";

import { useState, useEffect } from "react";
import { Send, ShieldAlert, Link as LinkIcon, Check } from "lucide-react";

interface ResendPortalLinkProps {
  clientId: string;
  clientName: string;
  onSend?: () => void;
}

const MAX_RESEND_LIMIT = 5;

export function ResendPortalLink({
  clientId,
  clientName,
  onSend,
}: ResendPortalLinkProps) {
  const [resendCount, setResendCount] = useState<number>(0);
  const [status, setStatus] = useState<
    "IDLE" | "SENDING" | "SUCCESS" | "LOCKED"
  >("IDLE");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const storageKey = `mobase_portal_resends_${clientId}`;
      const count = parseInt(localStorage.getItem(storageKey) || "0", 10);
      setResendCount(count);
      if (count >= MAX_RESEND_LIMIT) {
        setStatus("LOCKED");
      }
    } catch {
      setResendCount(0);
    }
  }, [clientId]);

  const handleResend = async () => {
    if (resendCount >= MAX_RESEND_LIMIT) {
      setStatus("LOCKED");
      return;
    }

    setStatus("SENDING");
    const nextCount = resendCount + 1;

    try {
      await fetch("/api/dev/leads/portal-link/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      }).catch(() => {});

      setResendCount(nextCount);
      localStorage.setItem(
        `mobase_portal_resends_${clientId}`,
        nextCount.toString(),
      );

      if (nextCount >= MAX_RESEND_LIMIT) {
        setStatus("LOCKED");
      } else {
        setStatus("SUCCESS");
        setTimeout(() => setStatus("IDLE"), 3000);
      }

      if (onSend) onSend();
    } catch {
      setResendCount(nextCount);
      localStorage.setItem(
        `mobase_portal_resends_${clientId}`,
        nextCount.toString(),
      );
      if (nextCount >= MAX_RESEND_LIMIT) {
        setStatus("LOCKED");
      } else {
        setStatus("SUCCESS");
        setTimeout(() => setStatus("IDLE"), 3000);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://mobase.com/portal/escrow/${clientId}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "LOCKED" || resendCount >= MAX_RESEND_LIMIT) {
    return (
      <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono space-y-1">
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            Dispatch Lockout Active ({resendCount}/{MAX_RESEND_LIMIT})
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)]">
          Rate limit reached for {clientName}. Contact MoBase Atelier Concierge
          to re-authorize manual link generation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)]">
        <div className="space-y-0.5">
          <span className="text-xs font-mono font-medium text-[var(--text-primary)] block">
            Escrow & Settlement Portal Link
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)] block">
            Remaining Direct Dispatches: {MAX_RESEND_LIMIT - resendCount} of{" "}
            {MAX_RESEND_LIMIT}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            type="button"
            className="px-3 py-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-mono rounded-lg transition-colors cursor-pointer border border-[var(--border-glass)] flex items-center gap-1.5"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            )}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>

          <button
            onClick={handleResend}
            disabled={status === "SENDING"}
            type="button"
            className="px-3.5 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {status === "SENDING"
                ? "Sending..."
                : status === "SUCCESS"
                  ? "Dispatched"
                  : "Send Portal"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
