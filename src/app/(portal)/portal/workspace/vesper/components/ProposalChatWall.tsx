"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  X,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Send,
  FileText,
} from "lucide-react";

interface ProposalChatWallProps {
  isOpen: boolean;
  onClose: () => void;
  onDeductCredits: (amount: number) => void;
  activeLeadName?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "vesper";
  text: string;
  timestamp: string;
}

export const ProposalChatWall: React.FC<ProposalChatWallProps> = ({
  isOpen,
  onClose,
  onDeductCredits,
  activeLeadName = "Target Client",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "init_proposal",
          sender: "vesper",
          text: `Proposal generator ready for ${activeLeadName}. Let me know if you want a complete memorandum, milestone deposit terms, or SLA parameters. Explicit prices remain masked under Tier Gates.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [isOpen, activeLeadName, messages.length]);

  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSendPrompt = (customPrompt?: string) => {
    const text = (customPrompt || inputQuery).trim();
    if (!text || isGenerating) return;

    if (!customPrompt) setInputQuery("");

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    onDeductCredits(10);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (
        lower.includes("memo") ||
        lower.includes("term") ||
        lower.includes("sheet")
      ) {
        reply = `PROJECT MEMORANDUM // ${activeLeadName.toUpperCase()}\n\n1. SCOPE:\nDevelopment of a high-speed web application with direct WhatsApp ordering and SEO optimization.\n\n2. ENGAGEMENT MODEL:\n• Assigned Tier: TIER_ALPHA_01 (Masked Pricing)\n• Payment Terms: 50% deposit upon agreement / 50% upon domain transfer\n• Delivery Timeframe: 48 hours for core prototype\n\n3. SERVICE GUARANTEE:\n• 99.9% uptime commitment\n• 30 days post-launch technical maintenance.`;
      } else if (lower.includes("sla") || lower.includes("guarantee")) {
        reply = `SLA & SUPPORT TERMS:\n• Maintenance: 30 days of active post-launch technical support included.\n• Performance: Mobile load speeds under 2 seconds guaranteed.`;
      } else {
        reply = `PROPOSAL SUMMARY FOR ${activeLeadName.toUpperCase()}:\n\nAssigned Tier: TIER_ALPHA_01 (50/50 Deposit Escrow Structure).\n\nAsk Vesper to generate a full Markdown proposal or customize SLA parameters.`;
      }

      const vesperMsg: ChatMessage = {
        id: `vesper_${Date.now()}`,
        sender: "vesper",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, vesperMsg]);
      setIsGenerating(false);
    }, 700);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-mono text-xs select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-2xl relative text-[var(--text-primary)] flex flex-col h-[540px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>PROPOSAL GENERATOR</span>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  </h3>
                  <span className="text-[10px] text-[var(--accent-gold)] font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>10 CR • {activeLeadName}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stream */}
            <div
              ref={chatStreamRef}
              className="flex-1 overflow-y-auto space-y-3 p-3 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-glass)]"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="p-1.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--accent-gold)] shrink-0">
                    {msg.sender === "user" ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap relative group ${
                      msg.sender === "user"
                        ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold rounded-tr-none"
                        : "bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.sender === "vesper" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-[var(--accent-gold)] font-bold hover:underline cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>
                          {copiedId === msg.id ? "Copied" : "Copy Terms"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-2 text-[var(--accent-gold)] text-[11px] p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting proposal terms...</span>
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <button
                type="button"
                onClick={() => handleSendPrompt("Draft project memorandum")}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)] whitespace-nowrap cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>Memorandum</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendPrompt("Detail 50/50 deposit terms")}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)] whitespace-nowrap cursor-pointer"
              >
                Deposit Terms
              </button>
              <button
                type="button"
                onClick={() => handleSendPrompt("Detail SLA and support terms")}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)] whitespace-nowrap cursor-pointer"
              >
                SLA Guarantee
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask Vesper for proposal drafts..."
                className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono"
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold uppercase hover:bg-[var(--accent-gold-hover)] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Draft</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
