"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Building2,
  MessageSquare,
} from "lucide-react";

interface OutreachChatWallProps {
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

export const OutreachChatWall: React.FC<OutreachChatWallProps> = ({
  isOpen,
  onClose,
  onDeductCredits,
  activeLeadName = "Target Client",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isFormulating, setIsFormulating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "init_outreach",
          sender: "vesper",
          text: `Outreach strategy ready for ${activeLeadName}. I can draft initial pitch hooks, quick follow-ups, or help you answer price objections. What angle are we taking?`,
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
  }, [messages, isFormulating]);

  const handleSendPrompt = (customPrompt?: string) => {
    const text = (customPrompt || inputQuery).trim();
    if (!text || isFormulating) return;

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
    setIsFormulating(true);
    onDeductCredits(5);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (
        lower.includes("hook") ||
        lower.includes("initial") ||
        lower.includes("first")
      ) {
        reply = `INITIAL WHATSAPP PITCH FOR ${activeLeadName.toUpperCase()}:\n\n"Hi! I was checking out ${activeLeadName} online. You've got great reviews, but missing a direct web booking portal—so potential customers end up going elsewhere.\n\nI built a live demo specifically for ${activeLeadName}. Mind if I send over the link?"`;
      } else if (
        lower.includes("objection") ||
        lower.includes("price") ||
        lower.includes("expensive")
      ) {
        reply = `PRICE OBJECTION RESPONSE:\n\n"Completely understand. We don't ask for full upfront payment anyway—just a 50% deposit to launch your live portal, and the rest after your first two weeks of active bookings."`;
      } else if (lower.includes("follow") || lower.includes("nudge")) {
        reply = `FOLLOW-UP MESSAGE:\n\n"Hey! Just following up on the custom prototype I built for ${activeLeadName}. Let me know if you'd like to take a look before I take the demo down."`;
      } else {
        reply = `PITCH DRAFT FOR ${activeLeadName.toUpperCase()}:\n\n"Hi there! We put together a high-speed web booking portal tailored for ${activeLeadName} to help double your direct WhatsApp inquiries. Here's your live demo link: [PROTOTYPE_URL]. Let me know what you think!"`;
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
      setIsFormulating(false);
    }, 600);
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
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>OUTREACH GENERATOR</span>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  </h3>
                  <span className="text-[10px] text-[var(--accent-gold)] font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>5 CR • {activeLeadName}</span>
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
                          {copiedId === msg.id ? "Copied" : "Copy Message"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isFormulating && (
                <div className="flex items-center gap-2 text-[var(--accent-gold)] text-[11px] p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting pitch message...</span>
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <button
                type="button"
                onClick={() => handleSendPrompt("Draft initial hook")}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)] whitespace-nowrap cursor-pointer"
              >
                Initial Pitch
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendPrompt("Draft price objection response")
                }
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)] whitespace-nowrap cursor-pointer"
              >
                Price Pushback
              </button>
              <button
                type="button"
                onClick={() => handleSendPrompt("Draft follow-up nudge")}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)] whitespace-nowrap cursor-pointer"
              >
                Follow-Up
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
                placeholder="Ask Vesper for outreach scripts..."
                className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono"
              />
              <button
                type="submit"
                disabled={isFormulating}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold uppercase hover:bg-[var(--accent-gold-hover)] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pitch</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
