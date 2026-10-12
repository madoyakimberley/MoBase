"use client";

import react from "react";
import {
  Bot,
  Cpu,
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useVesperWebLLM } from "../../../../../../lib/vesper/useVesperWebLLM";
import {
  vesperDb,
  VesperAuditRecord,
} from "../../../../../../lib/vesper/vesperLocalDb";

interface TierConfirmationProps {
  selectedLead?: {
    id: string;
    name: string;
    category?: string;
    city?: string;
    reviewsCount?: number;
    hasWebsite?: boolean;
  };
}

export function TierConfirmation({ selectedLead }: TierConfirmationProps) {
  const {
    credits,
    isReady,
    isInitializing,
    isGenerating,
    loadingProgress,
    initializeEngine,
    runAudit,
    syncCredits,
  } = useVesperWebLLM();

  const [currentAudit, setCurrentAudit] =
    react.useState<VesperAuditRecord | null>(null);
  const [errorMsg, setErrorMsg] = react.useState<string>("");

  react.useEffect(() => {
    syncCredits();
  }, [syncCredits]);

  // Load latest audit for selected lead from Dexie
  react.useEffect(() => {
    if (!selectedLead?.id) return;
    vesperDb.audits
      .where("leadId")
      .equals(selectedLead.id)
      .reverse()
      .sortBy("createdAt")
      .then((records: string | any[]) => {
        if (records.length > 0) {
          setCurrentAudit(records[0]);
        } else {
          setCurrentAudit(null);
        }
      });
  }, [selectedLead?.id]);

  const handleTriggerAudit = async () => {
    if (!selectedLead) return;
    setErrorMsg("");

    try {
      if (!isReady) {
        await initializeEngine();
        return;
      }
      const result = await runAudit(selectedLead);
      if (result) setCurrentAudit(result);
    } catch (err: any) {
      setErrorMsg(err?.message || "Audit execution failed.");
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-glass)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>Vesper AI Tier Gate</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                100% LOCAL WEBGPU
              </span>
            </h3>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              In-Browser Local LLM • Zero Server Token Cost
            </p>
          </div>
        </div>

        {/* Local Credits Status Badge */}
        <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] flex items-center gap-2 font-mono text-xs shrink-0">
          <Lock className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <span className="text-[var(--text-muted)]">Vault Balance:</span>
          <span className="font-bold text-[var(--accent-gold)]">
            {credits.toLocaleString()} Credits
          </span>
        </div>
      </div>

      {/* WebGPU Status / Trigger Controls */}
      <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Cpu className="w-4 h-4 text-[var(--accent-gold)]" />
            <span>Hardware Engine:</span>
            <span className="font-bold text-[var(--text-primary)]">
              Qwen2.5-0.5B (WebGPU)
            </span>
          </div>

          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
              isReady
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            {isReady ? "GPU Ready" : "Unloaded"}
          </span>
        </div>

        {loadingProgress && (
          <div className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-glass)] truncate">
            {loadingProgress}
          </div>
        )}

        {errorMsg && (
          <div className="text-xs text-red-400 bg-red-950/30 p-2.5 rounded-lg border border-red-800/30">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleTriggerAudit}
          disabled={isInitializing || isGenerating || !selectedLead}
          className="w-full py-3 px-4 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
        >
          {isInitializing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Booting Local GPU Model...</span>
            </>
          ) : isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Running Local Vesper Evaluation...</span>
            </>
          ) : !isReady ? (
            <>
              <Zap className="w-4 h-4" />
              <span>Initialize GPU AI Engine</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Run Vesper Audit (-10 Vault Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Audit Results Section */}
      {currentAudit && (
        <div className="space-y-4 pt-2 border-t border-[var(--border-glass)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                ASSIGNED TIER
              </span>
              <span className="text-base font-serif font-bold text-[var(--accent-gold)] block mt-0.5">
                {currentAudit.assignedTier}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                RECOMMENDED QUOTE
              </span>
              <span className="text-base font-serif font-bold text-[var(--text-primary)] block mt-0.5">
                ${currentAudit.suggestedPriceUSD.toLocaleString()} USD
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                CONFIDENCE INDEX
              </span>
              <span className="text-base font-serif font-bold text-emerald-400 block mt-0.5">
                {currentAudit.confidenceScore}%
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <p className="text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-canvas)] p-3 rounded-xl border border-[var(--border-glass)]">
              {currentAudit.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] uppercase text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Value Drivers
                </span>
                <ul className="text-[11px] text-[var(--text-secondary)] space-y-0.5 list-disc list-inside">
                  {currentAudit.valueDrivers.map(
                    (
                      vd:
                        | string
                        | number
                        | bigint
                        | boolean
                        | react.ReactElement<
                            unknown,
                            string | react.JSXElementConstructor<any>
                          >
                        | Iterable<react.ReactNode>
                        | react.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | react.ReactPortal
                            | react.ReactElement<
                                unknown,
                                string | react.JSXElementConstructor<any>
                              >
                            | Iterable<react.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      idx: react.Key | null | undefined,
                    ) => (
                      <li key={idx}>{vd}</li>
                    ),
                  )}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                <span className="text-[10px] uppercase text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors
                </span>
                <ul className="text-[11px] text-[var(--text-secondary)] space-y-0.5 list-disc list-inside">
                  {currentAudit.riskFactors.map(
                    (
                      rf:
                        | string
                        | number
                        | bigint
                        | boolean
                        | react.ReactElement<
                            unknown,
                            string | react.JSXElementConstructor<any>
                          >
                        | Iterable<react.ReactNode>
                        | react.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | react.ReactPortal
                            | react.ReactElement<
                                unknown,
                                string | react.JSXElementConstructor<any>
                              >
                            | Iterable<react.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      idx: react.Key | null | undefined,
                    ) => (
                      <li key={idx}>{rf}</li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Stamp */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>IndexedDB Vault & Encrypted State Active</span>
      </div>
    </div>
  );
}
