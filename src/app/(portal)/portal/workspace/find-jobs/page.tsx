"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ShieldAlert,
  Compass,
  TrendingUp,
  Filter,
  PhoneOff,
  ArrowRight,
  QrCode,
  ChevronDown,
} from "lucide-react";

import { Lead } from "./components/types";
import { LeadCard } from "./components/LeadCard";
import { QrModal } from "./components/QrModal";
import { ChatDrawer } from "./components/ChatDrawer";
import { JobCardsGridSkeleton } from "@/components/ui/skeleton/JobSkeleton";

const PRESET_QUERIES = [
  { label: "Salons in Ruiru", query: "salons in Ruiru", minReviews: 15 },
  {
    label: "Auto Garages in Nairobi",
    query: "auto garages in Nairobi",
    minReviews: 20,
  },
  {
    label: "Bakeries in Westlands",
    query: "bakeries in Westlands",
    minReviews: 10,
  },
  {
    label: "Hardware Stores in Eldoret",
    query: "hardware stores in Eldoret",
    minReviews: 15,
  },
  {
    label: "Boutiques in Mombasa",
    query: "boutiques in Mombasa",
    minReviews: 10,
  },
];

export default function FindJobsPage() {
  const [query, setQuery] = useState("salons in Ruiru");
  const [minReviews, setMinReviews] = useState(15);
  const [loading, setLoading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(3); // Lazy render batching
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // WhatsApp QR Code & Session State
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isWhatsAppConnected, setIsWhatsAppConnected] =
    useState<boolean>(false);

  // Secure Chat Drawer State
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // On-Demand Worker Boot & QR status polling
  const handleOpenQrModal = async () => {
    setShowQrModal(true);
    if (!isWhatsAppConnected) {
      try {
        await fetch("/api/dev/whatsapp/start", { method: "POST" });
      } catch (err) {
        console.error("Failed to trigger WhatsApp worker:", err);
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/dev/whatsapp/status");
        if (res.ok) {
          const data = await res.json();
          setIsWhatsAppConnected(data.isConnected);
          setQrCodeData(data.qrCode);

          if (data.isConnected && showQrModal) {
            setShowQrModal(false);
          }
        }
      } catch (err) {
        console.error("Failed to check WhatsApp status:", err);
      }
    };

    checkStatus();
    if (showQrModal) {
      interval = setInterval(checkStatus, 2000);
    }

    return () => clearInterval(interval);
  }, [showQrModal]);

  const executeSearch = async (searchQuery: string, reviewsCutoff: number) => {
    setLoading(true);
    setError(null);
    setHasScanned(true);
    setVisibleCount(3); // Reset lazy display queue to 3 cards

    try {
      const res = await fetch(
        `/api/dev/leads/search?query=${encodeURIComponent(
          searchQuery,
        )}&minReviews=${reviewsCutoff}`,
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Failed to scan Google Maps");

      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, minReviews);
  };

  const handleStartChat = async (lead: Lead) => {
    setActiveLead(lead);
    if (lead.status === "UNCLAIMED") {
      try {
        await fetch("/api/dev/leads/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: lead.id }),
        });
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: "CLAIMED" } : l)),
        );
      } catch (err) {
        console.error("Claiming lead failed:", err);
      }
    }
  };

  const handleToggleClaim = async (lead: Lead) => {
    try {
      const res = await fetch("/api/dev/leads/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === lead.id ? { ...l, status: data.status } : l,
          ),
        );
      }
    } catch (err) {
      console.error("Claim failed:", err);
    }
  };

  const handleCopyPhone = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDismissLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: "CONTACTED") => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-gold)] opacity-5 blur-3xl pointer-events-none rounded-full -mr-20 -mt-20" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 uppercase font-semibold">
              ✨ Lead Discovery Console
            </span>
            <button
              onClick={handleOpenQrModal}
              className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-[var(--bg-canvas)] border border-[var(--border-glass)] hover:border-[var(--accent-gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3 h-3 text-[var(--accent-gold)]" />
              <span>
                WhatsApp: {isWhatsAppConnected ? "Connected" : "Scan QR"}
              </span>
            </button>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            Find High-Value Unclaimed Clients
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Scan Google Maps live for busy local businesses without a website.
            Claim jobs, start proxy WhatsApp outreach, or preview locations on
            Google Maps.
          </p>
        </div>

        {/* Quick Search Preset Chips */}
        <div className="mt-6 pt-6 border-t border-[var(--border-glass)]">
          <span className="text-[11px] font-mono text-[var(--text-muted)] block uppercase mb-3 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[var(--accent-gold)]" /> Quick
            Start Scans:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset.query}
                onClick={() => {
                  setQuery(preset.query);
                  setMinReviews(preset.minReviews);
                  executeSearch(preset.query, preset.minReviews);
                }}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-xs font-mono text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 group"
              >
                <span>{preset.label}</span>
                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 shadow-sm"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. barber shops in Nairobi, salons in Ruiru..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-canvas)] px-3 py-1.5 rounded-xl border border-[var(--border-glass)]">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Min Reviews:
            </span>
            <input
              type="number"
              value={minReviews}
              onChange={(e) => setMinReviews(parseInt(e.target.value, 10) || 0)}
              className="w-14 bg-transparent text-xs font-mono text-center font-bold text-[var(--accent-gold)] focus:outline-none"
              min="0"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] text-xs font-mono font-medium rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? "Scanning..." : "Scan Qualified Leads"}</span>
          </button>
        </div>
      </form>

      {/* Skeleton Loading State for Grid */}
      {loading && <JobCardsGridSkeleton count={3} />}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl font-mono flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pre-Search Empty State */}
      {!loading && !hasScanned && leads.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] flex items-center justify-center mx-auto border border-[var(--border-glass)]">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-serif text-xl">Ready to Find Clients?</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Click a quick start option above or enter a search term like{" "}
              <span className="text-[var(--accent-gold)] font-mono">
                "salons in Ruiru"
              </span>
              .
            </p>
          </div>
        </div>
      )}

      {/* Zero Results State */}
      {!loading && hasScanned && leads.length === 0 && !error && (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <PhoneOff className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-serif text-xl">No Unclaimed Leads Found</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Google Maps returned businesses, but all top results either
              already have websites or fall below{" "}
              <span className="font-mono text-[var(--accent-gold)]">
                {minReviews} reviews
              </span>
              .
            </p>
          </div>
          <button
            onClick={() => {
              const lowerReviews = Math.max(0, minReviews - 10);
              setMinReviews(lowerReviews);
              executeSearch(query, lowerReviews);
            }}
            className="px-4 py-2 bg-[var(--bg-canvas)] border border-[var(--accent-gold)] text-xs font-mono text-[var(--accent-gold)] rounded-xl hover:bg-[var(--accent-gold)] hover:text-[var(--bg-canvas)] transition-all cursor-pointer"
          >
            Lower Cutoff to {Math.max(0, minReviews - 10)} Reviews & Re-Scan
          </button>
        </div>
      )}

      {/* Discovered Leads Grid with Lazy Display */}
      {!loading && leads.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] px-1">
            <span>
              Showing {Math.min(visibleCount, leads.length)} of {leads.length}{" "}
              Verified Unclaimed Cards
            </span>
            <span>Lazy display stream active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.slice(0, visibleCount).map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                copiedId={copiedId}
                onStartChat={handleStartChat}
                onToggleClaim={handleToggleClaim}
                onCopyPhone={handleCopyPhone}
                onDismissLead={handleDismissLead}
              />
            ))}
          </div>

          {/* Lazy Load Trigger Button */}
          {visibleCount < leads.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 3)}
                className="px-6 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-xs font-mono text-[var(--accent-gold)] rounded-2xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <span>
                  Load More Leads ({leads.length - visibleCount} remaining)
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Link QR Modal */}
      {showQrModal && (
        <QrModal
          qrCodeData={qrCodeData}
          isWhatsAppConnected={isWhatsAppConnected}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Masked Secure Proxy Chat Drawer */}
      {activeLead && (
        <ChatDrawer
          activeLead={activeLead}
          isWhatsAppConnected={isWhatsAppConnected}
          onClose={() => setActiveLead(null)}
          onOpenQrModal={handleOpenQrModal}
          onStatusUpdate={handleUpdateLeadStatus}
        />
      )}
    </div>
  );
}
