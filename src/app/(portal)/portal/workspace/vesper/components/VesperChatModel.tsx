"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  User,
  RefreshCw,
  Sparkles,
  Building2,
} from "lucide-react";

interface VesperChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLeadName?: string;
}

export const VesperChatModal: React.FC<VesperChatModalProps> = ({
  isOpen,
  onClose,
  activeLeadName = "Target Client",
}) => {
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "vesper"; text: string }>
  >([
    {
      sender: "vesper",
      text: `Vesper here. I've pulled up the context for ${activeLeadName}. What do you need—design direction, a tight WhatsApp pitch hook, or account strategy?`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = () => {
    if (!inputQuery.trim() || isThinking) return;

    const query = inputQuery;
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setInputQuery("");
    setIsThinking(true);

    setTimeout(() => {
      let reply = `For ${activeLeadName}, I'd prioritize a mobile-first layout with direct WhatsApp booking triggers to capture traffic immediately.`;

      const q = query.toLowerCase();
      if (q.includes("design") || q.includes("style")) {
        reply = `DESIGN DIRECTION FOR ${activeLeadName.toUpperCase()}:\n• Color Scheme: Obsidian background (#0B0F17) with Warm Champagne Gold (#D4AF37) highlights.\n• Typography: Display Serif for main titles, paired with clean Mono for details.\n• Primary Focus: Sticky WhatsApp conversion bar at the bottom of the screen.`;
      } else if (
        q.includes("outreach") ||
        q.includes("script") ||
        q.includes("pitch")
      ) {
        reply = `OUTREACH ANGLE:\nUse the Outreach Generator to draft a brief WhatsApp message highlighting their missing website and linking directly to your live prototype.`;
      } else if (q.includes("tier") || q.includes("price")) {
        reply = `Pricing stays masked under Tier Gates for now. We can discuss exact figures once we initiate direct conversation with ${activeLeadName}.`;
      }

      setMessages((prev) => [...prev, { sender: "vesper", text: reply }]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-mono text-xs select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-2xl relative text-[var(--text-primary)] flex flex-col h-[520px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>ASK VESPER AI</span>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  </h3>
                  <span className="text-[10px] text-[var(--accent-gold)] font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>CLIENT: {activeLeadName}</span>
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

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-glass)]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
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
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold rounded-tr-none"
                        : "bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-[var(--accent-gold)] text-[11px] p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking through strategy...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask Vesper about design, pitch hooks, or strategy..."
                className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold uppercase hover:bg-[var(--accent-gold-hover)] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
