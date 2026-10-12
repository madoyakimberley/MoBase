"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Phone,
  Globe,
  UserCheck,
} from "lucide-react";
import { ClientDetails, ClientDetailsData } from "./components/ClientDetails";
import { ChatWall } from "./components/ChatWall";
import { ChatDrawer } from "../find-jobs/components/ChatDrawer";
import { Lead } from "../find-jobs/components/types";

export interface ClientRecord extends ClientDetailsData {
  status: "CLAIMED" | "CONTACTED" | "CONVERTED" | "ARCHIVED";
  claimedAt?: string;
  maskedPhone?: string;
  phone?: string;
  realPhoneNumber?: string;
  category?: string;
  city?: string;
  reviewsCount?: number;
  hasWebsite?: boolean;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Clients");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(
    null,
  );
  const [activeChatLead, setActiveChatLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch real claimed/contacted clients from database
  const loadClaimedClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/leads/claimed");
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data.leads)) {
          setClients(data.leads);
          if (data.leads.length > 0 && !selectedClient) {
            setSelectedClient(data.leads[0]);
          }
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch clients from API:", err);
    }

    // Offline cache fallback
    try {
      const cached = localStorage.getItem("mobase_cached_leads");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const claimedOnly = parsed.filter(
            (l: any) => l.status !== "UNCLAIMED",
          );
          setClients(claimedOnly);
          if (claimedOnly.length > 0 && !selectedClient) {
            setSelectedClient(claimedOnly[0]);
          }
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

  // Convert ClientRecord to Lead for ChatDrawer
  const getActiveLead = (client: ClientRecord): Lead => {
    return {
      id: client.id,
      name: client.name,
      category: client.category || "Local Business",
      niche: client.category || "Local Business",
      city: client.city || "Kenya",
      maskedPhone: client.maskedPhone || client.phone || "Masked Contact",
      rawPhone: client.realPhoneNumber || client.phone || "",
      reviewsCount: client.reviewsCount || 0,
      hasWebsite: client.hasWebsite ?? false,
      status: client.status === "CLAIMED" ? "CLAIMED" : "CONTACTED",
    } as unknown as Lead;
  };

  // Dynamic metrics calculations
  const totalClients = clients.length;
  const contactedCount = clients.filter((c) => c.status === "CONTACTED").length;
  const claimedCount = clients.filter((c) => c.status === "CLAIMED").length;
  const convertedCount = clients.filter((c) => c.status === "CONVERTED").length;

  // Filter clients dynamically
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.category || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "Claimed") return client.status === "CLAIMED";
    if (activeFilter === "Contacted") return client.status === "CONTACTED";
    if (activeFilter === "Converted") return client.status === "CONVERTED";
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1700px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-glass)] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[var(--accent-gold)] font-bold">
            <span>🛡️ DEVELOPER WORKSPACE</span>
            <span>•</span>
            <span>CLIENT DIRECTORY</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Active Clients{" "}
            <span className="italic font-normal text-[var(--accent-gold)]">
              &
            </span>{" "}
            Live Outreach
          </h1>
        </div>

        <button
          onClick={loadClaimedClients}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-mono text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 self-start lg:self-auto"
        >
          <span>🔄 Sync Database Clients</span>
        </button>
      </div>

      {/* Dynamic Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">
              TOTAL MANAGED CLIENTS
            </span>
            <UserCheck className="w-4 h-4 text-[var(--accent-gold)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--text-primary)]">
              {totalClients}
            </span>
            <span className="text-xs font-mono text-emerald-400">
              Active in DB
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
            Claimed or contacted leads
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">PENDING OUTREACH</span>
            <Phone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-amber-400">
              {claimedCount}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Leads
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
            Claimed, awaiting initial message
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">CONTACTED CLIENTS</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-emerald-400">
              {contactedCount}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Leads
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
            WhatsApp conversations opened
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold">CONVERTED JOBS</span>
            <Globe className="w-4 h-4 text-[var(--accent-gold)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--accent-gold)]">
              {convertedCount}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Clients
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
            Active website deployments
          </div>
        </div>
      </div>

      {/* Filter Navigation Bar */}
      <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name or niche..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs font-mono">
          {["All Clients", "Claimed", "Contacted", "Converted"].map((pill) => (
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

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Client Roster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-[var(--text-muted)]">
            <span className="uppercase font-semibold tracking-wider">
              CLIENT ROSTER ({filteredClients.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] animate-pulse">
              Loading client database records...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <span className="text-3xl">📋</span>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                No clients match your filter.
              </p>
            </div>
          ) : (
            filteredClients.map((client) => {
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
                        {client.category || "Local Business"}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        client.status === "CLAIMED"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : client.status === "CONTACTED"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[var(--border-glass)]">
                    <span className="text-[var(--text-secondary)]">
                      {client.maskedPhone ||
                        client.phone ||
                        "Contact Protected"}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      VIEW DETAILS{" "}
                      <ChevronRight className="w-3 h-3 text-[var(--accent-gold)]" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Client Details & Live Chat Stream */}
        <div className="lg:col-span-7 space-y-6">
          {selectedClient ? (
            <>
              <ClientDetails
                client={selectedClient}
                onUpdateClient={handleUpdateClient}
              />
              <ChatWall
                activeLead={getActiveLead(selectedClient)}
                onOpenChat={(lead) => setActiveChatLead(lead)}
              />
            </>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <ShieldCheck className="w-12 h-12 mx-auto text-[var(--accent-gold)] opacity-70" />
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Select a client on the left to inspect details and live WhatsApp
                messages.
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
