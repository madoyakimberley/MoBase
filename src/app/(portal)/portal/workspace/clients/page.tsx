"use client";

import { useState, useEffect } from "react";
import { Search, ShieldCheck, ChevronRight } from "lucide-react";
import { ClientDetails, ClientDetailsData } from "./components/ClientDetails";
import { TierConfirmation } from "./components/TierConfirmation";
import { ChatWall } from "./components/ChatWall";
import { ChatDrawer } from "../find-jobs/components/ChatDrawer";
import { Lead } from "../find-jobs/components/types";

export interface ClientRecord extends ClientDetailsData {
  status: "CLAIMED" | "CONTACTED" | "CONVERTED" | "ARCHIVED";
  claimedAt: string;
  maskedPhone: string;
  rawPhone: string;
  amountLabel?: string;
  badgeLabel?: string;
  badgeStyle?: string;
  principalName?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Commissions");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(
    null,
  );
  const [activeChatLead, setActiveChatLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load claimed client records
  const loadClaimedClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/leads/claimed");
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data.leads) && data.leads.length > 0) {
          setClients(data.leads);
          if (!selectedClient && data.leads.length > 0) {
            setSelectedClient(data.leads[0]);
          }
          setLoading(false);
          return;
        }
      }
    } catch {
      // Offline fallback
    }

    try {
      const cached = localStorage.getItem("mobase_cached_leads");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClients(parsed);
          if (!selectedClient) setSelectedClient(parsed[0]);
        }
      }
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaimedClients();
  }, []);

  const handleUpdateClient = (updatedClient: ClientDetailsData) => {
    const updatedList = clients.map((c) =>
      c.id === updatedClient.id ? { ...c, ...updatedClient } : c,
    );
    setClients(updatedList as ClientRecord[]);
    setSelectedClient((prev) =>
      prev ? ({ ...prev, ...updatedClient } as ClientRecord) : null,
    );
    localStorage.setItem("mobase_cached_leads", JSON.stringify(updatedList));
  };

  const handleOpenChat = (lead: Lead) => {
    setActiveChatLead(lead);
  };

  // Safe lead mapper eliminating inline object type errors
  const getActiveLead = (client: ClientRecord): Lead => {
    return {
      id: client.id,
      name: client.name,
      category: client.category || "General",
      niche: client.category || "General",
      city: "Nairobi",
      maskedPhone: client.maskedPhone || "Masked Contact",
      rawPhone: client.rawPhone || "",
      reviewsCount: client.reviewsCount || 0,
      hasWebsite: client.hasWebsite ?? false,
      status: client.status === "CLAIMED" ? "CLAIMED" : "CONTACTED",
    } as unknown as Lead;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1700px] mx-auto pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-glass)] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[var(--accent-gold)] font-bold">
            <span>🛡️ PRIVATE CLIENT CONCIERGE</span>
            <span>•</span>
            <span>FISCAL LEDGER</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Client Dossiers{" "}
            <span className="italic font-normal text-[var(--accent-gold)]">
              &
            </span>{" "}
            Financial Wall
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-glass)] text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>📡 Initiate Broadcast</span>
          </button>
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-mono text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>📜 Issue Invoice & Settlement Link</span>
          </button>
        </div>
      </div>

      {/* 4-Card Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">ACTIVE ENGAGEMENTS</span>
            <span className="text-[var(--accent-gold)]">🛡️</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--text-primary)]">
              18
            </span>
            <span className="text-xs font-mono text-emerald-400">
              +2 this quarter
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span>Atelier Commissions</span>
            <span className="text-[var(--text-primary)] font-bold">
              100% Retained
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">PENDING SETTLEMENTS</span>
            <span className="text-[var(--accent-gold)]">📂</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--accent-gold)]">
              $428,500
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              USD
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span>3 Milestones Active</span>
            <span className="text-[var(--text-primary)] font-bold">
              Net-15 Cycle
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">DISPUTED / ESCROW</span>
            <span className="text-[var(--text-muted)]">🔒</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--text-primary)]">
              $92,000
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              USD
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span>Milestone Hold</span>
            <span className="text-[var(--accent-gold)] font-bold">
              Smart Vault
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">WALL TRANSMISSIONS</span>
            <span className="text-[var(--accent-gold)]">💬</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--text-primary)]">
              5
            </span>
            <span className="text-xs font-mono text-amber-400">
              Unread Dispatches
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
            <span>Client Inquiries</span>
            <span className="text-red-400 font-bold">2 Urgent Action</span>
          </div>
        </div>
      </div>

      {/* Filter Pill Navigation Bar */}
      <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by mail..."
            className="w-full pl-10 pr-8 py-2 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-muted)]">
            ⌘K
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs font-mono">
          {[
            "All Commissions",
            "Pending Payment",
            "Under Review",
            "Retainer Active",
            "VIP Maison",
          ].map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setActiveFilter(pill)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === pill
                  ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold shadow-sm"
                  : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)]"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Private Client Roster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold tracking-wider">
              PRIVATE CLIENT ROSTER
            </span>
            <span>
              <strong className="text-[var(--accent-gold)]">
                {clients.length} Selected
              </strong>{" "}
              • Sorted by settlement urgency
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
              Loading client dossiers...
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <span className="text-3xl">🏛️</span>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                No client dossiers found.
              </p>
            </div>
          ) : (
            clients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-5 rounded-2xl bg-[var(--bg-surface)] border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? "border-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]/30 shadow-md"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-glass)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                        {client.name}
                      </h3>
                      <p className="text-xs font-mono text-[var(--text-muted)]">
                        {client.category}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        client.status === "CLAIMED"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : client.status === "CONVERTED"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-950/40 border-red-800/40 text-red-400"
                      }`}
                    >
                      {client.badgeLabel || client.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-glass)] text-xs font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                        COMMISSION
                      </span>
                      <span className="text-[var(--text-primary)] font-semibold truncate block">
                        {client.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                        PRINCIPAL
                      </span>
                      <span className="text-[var(--text-primary)] font-semibold truncate block">
                        {client.principalName || "Alistair Vartanian"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-[var(--accent-gold)] font-bold">
                      {client.amountLabel || "$185,000.00 USD pending"}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      ACTIVE DOSSIER{" "}
                      <ChevronRight className="w-3 h-3 text-[var(--accent-gold)]" />
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Bottom Security Consensus Badge */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--accent-gold)] shrink-0">
              🛡️
            </div>
            <div className="flex-1">
              <span className="font-bold text-[var(--text-primary)] block">
                Client Identity Verification
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block">
                Consensus: Multi-Sig Biometric Passed
              </span>
            </div>
            <span className="text-emerald-400 font-bold font-serif text-sm">
              99.8% TRUST
            </span>
          </div>
        </div>

        {/* Right Column: Selected Client Dossier & Financial Wall */}
        <div className="lg:col-span-7 space-y-6">
          {selectedClient ? (
            <>
              <ClientDetails
                client={selectedClient}
                onUpdateClient={handleUpdateClient}
              />
              <TierConfirmation />
              <ChatWall
                activeLead={getActiveLead(selectedClient)}
                onOpenChat={handleOpenChat}
              />
            </>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <ShieldCheck className="w-12 h-12 mx-auto text-[var(--accent-gold)] opacity-70" />
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Select a private client roster item on the left to inspect
                executive dossiers, settlement gates, and direct dispatches.
              </p>
            </div>
          )}
        </div>
      </div>

      {activeChatLead && (
        <ChatDrawer
          activeLead={activeChatLead}
          isWhatsAppConnected={true}
          onClose={() => setActiveChatLead(null)}
          onOpenQrModal={() => {}}
          onStatusUpdate={() => {}}
        />
      )}
    </div>
  );
}
