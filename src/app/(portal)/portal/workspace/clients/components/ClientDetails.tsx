"use client";

import { useState } from "react";
import {
  Download,
  MoreVertical,
  CreditCard,
  Send,
  CheckCircle2,
  Globe,
  ExternalLink,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { ResendPortalLink } from "./ResendPortalLink";

export interface ClientDetailsData {
  id: string;
  name: string;
  category: string;
  reviewsCount: number;
  hasWebsite: boolean;
  liveUrl?: string;
  projectUrl?: string;
  notes?: string;
  maskedPhone?: string;
  commissionRef?: string;
  jurisdiction?: string;
  executiveLead?: string;
  milestoneProgress?: string;
  studioPartner?: string;
  trancheAmount?: number;
  vatAmount?: number;
  totalRemittance?: number;
  dueDateLabel?: string;
}

interface ClientDetailsProps {
  client: ClientDetailsData;
  onUpdateClient?: (updated: ClientDetailsData) => void;
}

export function ClientDetails({ client, onUpdateClient }: ClientDetailsProps) {
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(
    client.liveUrl || client.projectUrl || "",
  );
  const [savingUrl, setSavingUrl] = useState(false);

  const activeProjectUrl = client.liveUrl || client.projectUrl;

  const handleSaveProjectUrl = async () => {
    setSavingUrl(true);
    try {
      const res = await fetch("/api/dev/leads/project-url", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: client.id,
          projectUrl: urlInput,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const updatedClient = {
          ...client,
          liveUrl: data.projectUrl || urlInput,
          projectUrl: data.projectUrl || urlInput,
        };
        if (onUpdateClient) onUpdateClient(updatedClient);
        setIsEditingUrl(false);
      } else {
        alert(data.error || "Failed to update project URL.");
      }
    } catch (err) {
      console.error("Failed to save project URL:", err);
      // Fallback local update
      const updatedClient = {
        ...client,
        liveUrl: urlInput,
        projectUrl: urlInput,
      };
      if (onUpdateClient) onUpdateClient(updatedClient);
      setIsEditingUrl(false);
    } finally {
      setSavingUrl(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Client Header Box */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-glass)] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--accent-gold)] font-mono font-bold flex items-center justify-center text-base shrink-0">
              {getInitials(client.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  {client.name}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
              </div>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                Commission Ref:{" "}
                {client.commissionRef || `MB-${client.id.toUpperCase()}`} •{" "}
                {client.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-glass)] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Contract PDF</span>
            </button>
            <button
              type="button"
              className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-glass)] transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Deployed Live Prototype URL Card */}
        <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--accent-gold)] font-bold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Deployed Live Prototype
              Application
            </span>

            {!isEditingUrl && (
              <button
                onClick={() => {
                  setUrlInput(activeProjectUrl || "");
                  setIsEditingUrl(true);
                }}
                type="button"
                className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>{activeProjectUrl ? "Edit Link" : "Attach Link"}</span>
              </button>
            )}
          </div>

          {isEditingUrl ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste deployed URL (e.g. https://client-demo.vercel.app)..."
                className="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
              />
              <button
                onClick={handleSaveProjectUrl}
                disabled={savingUrl}
                type="button"
                className="p-2 bg-[var(--accent-gold)] text-[var(--bg-canvas)] rounded-lg hover:bg-[var(--accent-gold-hover)] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingUrl(false)}
                type="button"
                className="p-2 bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : activeProjectUrl ? (
            <a
              href={activeProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-semibold text-[var(--accent-gold)] hover:underline flex items-center gap-1.5 truncate pt-0.5"
            >
              <span className="truncate">{activeProjectUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          ) : (
            <span className="text-xs font-mono text-[var(--text-muted)] italic block pt-0.5">
              No live project URL linked yet. Click &quot;Attach Link&quot;
              above to add one.
            </span>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] block">
              Executive Lead
            </span>
            <span className="text-xs font-mono font-semibold text-[var(--text-primary)] block truncate">
              {client.executiveLead || "Alistair Vartanian"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] block">
              Jurisdiction
            </span>
            <span className="text-xs font-mono font-semibold text-[var(--text-primary)] block truncate">
              {client.jurisdiction || "CH / FINMA Compliant"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] block">
              Milestone Progress
            </span>
            <span className="text-xs font-mono font-semibold text-[var(--accent-gold)] block">
              {client.milestoneProgress || "Phase 3 of 4 (75%)"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] block">
              Atelier Studio Partner
            </span>
            <span className="text-xs font-mono font-semibold text-[var(--text-primary)] block truncate">
              {client.studioPartner || "Eleonora Castiglione"}
            </span>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-glass)] overflow-x-auto text-xs font-mono">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] font-bold border border-[var(--border-subtle)] cursor-pointer"
          >
            Client Chat Wall
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            Settlement & Ledger
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            Deliverables & Vault
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* Active Settlement Gate Box */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--accent-gold)] font-bold block">
                Active Settlement Gate
              </span>
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                Milestone 3 of 4: Phase II Spatial Twin Completion & Shader
                Source
              </h3>
            </div>
          </div>

          <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold shrink-0">
            {client.dueDateLabel || "Due in 3 Days (Oct 28, 2026)"}
          </span>
        </div>

        {/* Financial Breakdown Grid */}
        <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <div>
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Outstanding Tranche
            </span>
            <span className="text-xl font-bold text-[var(--accent-gold)] font-serif block mt-1">
              $
              {(client.trancheAmount || 185000).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              USD
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Applicable Swiss VAT
            </span>
            <span className="text-sm font-semibold text-[var(--text-secondary)] block mt-2">
              $
              {(client.vatAmount || 14985).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              USD
              <span className="text-[10px] text-[var(--text-muted)] ml-1">
                (8.1% CH-CHE)
              </span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">
              Total Remittance
            </span>
            <span className="text-base font-bold text-[var(--text-primary)] block mt-1">
              $
              {(client.totalRemittance || 199985).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              USD Net
            </span>
          </div>
        </div>

        {/* Approved Settlement Rails Pills */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] block">
            Approved Atelier Settlement Rails
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-3 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--text-secondary)]">
              🏦 Wire Transfer (CH-SWIFT)
            </span>
            <span className="px-3 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--text-secondary)]">
              🛡️ Cryptographic Escrow (USDC)
            </span>
            <span className="px-3 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--text-secondary)]">
              💳 Amex Centurion Commercial
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="py-3 px-4 rounded-xl bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Send Payment Reminder</span>
            </button>

            <ResendPortalLink clientId={client.id} clientName={client.name} />
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)] font-mono text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark as Settled Manually</span>
          </button>
        </div>
      </div>
    </div>
  );
}
