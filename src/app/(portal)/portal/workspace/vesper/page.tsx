"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { VesperCore } from "./components/VesperCore";
import { RadialModules } from "./components/RadialModules";
import { AuditChatWall } from "./components/AuditChatWall";
import { ProposalChatWall } from "./components/ProposalChatWall";
import { OutreachChatWall } from "./components/OutreachChatWall";
import { VesperChatModal } from "./components/VesperChatModel";
import { Bot, Clock, Sparkles } from "lucide-react";

interface ActiveJobContext {
  leadId: string;
  leadName: string;
  city: string;
  niche: string;
  prototypeDeadline: string;
}

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const urlLeadId = searchParams.get("leadId");

  const [isExpanded, setIsExpanded] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [credits, setCredits] = useState<number>(1000);
  const [activeJob, setActiveJob] = useState<ActiveJobContext | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("48:00:00");

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const creditRes = await fetch("/api/credits");
        const creditData = await creditRes.json();
        if (creditData.success) {
          setCredits(creditData.credits);
        }

        if (urlLeadId) {
          setActiveJob({
            leadId: urlLeadId,
            leadName: "Target Business Lead",
            city: "Nairobi",
            niche: "Enterprise Service",
            prototypeDeadline: new Date(
              Date.now() + 48 * 60 * 60 * 1000,
            ).toISOString(),
          });
        }
      } catch (err) {
        console.error("Failed to load Vesper session state:", err);
      }
    };

    loadSessionData();
  }, [urlLeadId]);

  useEffect(() => {
    if (!activeJob?.prototypeDeadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(activeJob.prototypeDeadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("DEADLINE EXPIRED");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJob]);

  const handleDeductCredits = async (amount: number) => {
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.success) {
        setCredits(data.credits);
      } else {
        setCredits((prev) => Math.max(0, prev - amount));
      }
    } catch {
      setCredits((prev) => Math.max(0, prev - amount));
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[var(--bg-canvas)] text-[var(--text-primary)] font-mono touch-none flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(var(--accent-gold) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {!auditOpen && (
        <div className="absolute top-6 sm:top-8 z-30 flex flex-col items-center gap-2 pointer-events-none text-center px-4">
          <div className="px-4 py-1.5 rounded-full border border-[var(--border-glass)] bg-[var(--bg-surface)]/80 text-[11px] font-mono text-[var(--text-secondary)] backdrop-blur-sm shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse" />
            <span className="tracking-[0.2em] uppercase font-medium">
              {isExpanded
                ? "DIRECTIVES ARMED • TAP CORE TO CLOSE"
                : "CLICK TO ACTIVATE VESPER"}
            </span>
          </div>

          {activeJob && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--accent-gold)] font-bold tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              <span>{activeJob.leadName}</span>
              <span className="text-[var(--text-muted)]">•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>TIMER: {timeLeft}</span>
            </div>
          )}
        </div>
      )}

      {!auditOpen && (
        <div className="absolute bottom-6 right-6 z-30 hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)]/80 border border-[var(--border-glass)] text-xs font-mono text-[var(--accent-gold)] font-bold shadow-sm pointer-events-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{credits} CREDITS</span>
        </div>
      )}

      <main className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-hidden">
        {!auditOpen ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <VesperCore
              isExpanded={isExpanded}
              onClick={() => setIsExpanded((prev) => !prev)}
              credits={credits}
            />

            <AnimatePresence>
              {isExpanded && (
                <RadialModules
                  onSelectAudit={() => setAuditOpen(true)}
                  onSelectProposal={() => setProposalModalOpen(true)}
                  onSelectOutreach={() => setOutreachModalOpen(true)}
                  onSelectChat={() => setChatModalOpen(true)}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <AuditChatWall
            onBack={() => setAuditOpen(false)}
            onDeductCredits={handleDeductCredits}
            credits={credits}
            activeLeadName={activeJob?.leadName}
          />
        )}
      </main>

      <ProposalChatWall
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        onDeductCredits={handleDeductCredits}
        activeLeadName={activeJob?.leadName}
      />
      <OutreachChatWall
        isOpen={outreachModalOpen}
        onClose={() => setOutreachModalOpen(false)}
        onDeductCredits={handleDeductCredits}
        activeLeadName={activeJob?.leadName}
      />
      <VesperChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        activeLeadName={activeJob?.leadName}
      />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 w-screen h-screen bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--accent-gold)] font-mono text-xs tracking-widest">
          INITIALIZING VESPER CORE...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
