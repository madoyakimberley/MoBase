"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  ArrowLeft,
  Send,
  User,
  Bot,
  RefreshCw,
  Globe,
  Sparkles,
  Lock,
} from "lucide-react";
import { VesperLogo } from "./VesperLogo";

interface AuditChatWallProps {
  onBack: () => void;
  onDeductCredits: (amount: number) => void;
  credits: number;
  activeLeadName?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "vesper";
  text: string;
  timestamp: string;
}

export const AuditChatWall: React.FC<AuditChatWallProps> = ({
  onBack,
  onDeductCredits,
  credits,
  activeLeadName = "Target Client",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_audit",
      sender: "vesper",
      text: `Ready to review ${activeLeadName}. Paste a live prototype link or ask me to evaluate their digital presence. All pricing stays masked under Tier Gates.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [prototypeUrl, setPrototypeUrl] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [messages, isAuditing]);

  const handleSendPrompt = (customText?: string) => {
    const text = (customText || inputQuery).trim();
    if (!text || isAuditing) return;

    if (!customText) setInputQuery("");

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
    setIsAuditing(true);
    onDeductCredits(10);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes("http") || lower.includes("url") || prototypeUrl) {
        reply = `PROTOTYPE AUDIT FOR: ${prototypeUrl || text}\n\n• Load Speed: Fast (1.1s)\n• Visual Structure: Clean hierarchy, clear headers\n• Main Improvement: Add a floating WhatsApp booking button at the bottom\n• Tier Gate Assignment: TIER_ALPHA_01 (Masked Pricing)\n\nRECOMMENDED ADJUSTMENTS:\n1. Make primary action buttons stand out more.\n2. Add social proof directly near the header.`;
      } else if (lower.includes("tier") || lower.includes("gate")) {
        reply = `TIER GATE STATUS FOR ${activeLeadName.toUpperCase()}:\n• Assigned Gate: TIER_ALPHA_01\n• Pricing: Masked during pre-outreach\n• Strategy: Anchor value on direct conversion and booking speed.`;
      } else {
        reply = `I'm ready to inspect ${activeLeadName}. Paste your deployed prototype URL above or ask a specific review question.`;
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
      setIsAuditing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] font-mono text-xs flex flex-col justify-between select-none">
      <header className="w-full flex items-center justify-between p-4 px-6 border-b border-[var(--border-glass)] bg-[var(--bg-surface)] backdrop-blur-md z-20">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--bg-canvas)] transition-all cursor-pointer font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO CORE</span>
        </button>

        <div className="flex items-center gap-2.5">
          <VesperLogo size={24} />
          <span className="font-serif font-bold text-sm text-[var(--text-primary)]">
            AUDIT MODULE
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--accent-gold)] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BALANCE: {credits} CR</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
        <div className="w-full md:w-[320px] p-5 border-r border-[var(--border-glass)] bg-[var(--bg-surface)]/80 flex flex-col justify-between space-y-4 shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold pb-2 border-b border-[var(--border-glass)]">
              <ShieldCheck className="w-4 h-4" />
              <span>TARGET REVIEW</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-1">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block">
                Client Name
              </span>
              <span className="font-bold text-[var(--text-primary)] block truncate">
                {activeLeadName}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[var(--text-muted)] uppercase block flex items-center gap-1">
                <Globe className="w-3 h-3 text-[var(--accent-gold)]" />{" "}
                Prototype Link
              </label>
              <input
                type="text"
                value={prototypeUrl}
                onChange={(e) => setPrototypeUrl(e.target.value)}
                placeholder="https://client-demo.vercel.app"
                className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-[11px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono"
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block">
                Quick Actions
              </span>
              <button
                type="button"
                onClick={() =>
                  handleSendPrompt(
                    `Inspect prototype link: ${prototypeUrl || "https://client-demo.vercel.app"}`,
                  )
                }
                className="w-full py-2 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--accent-gold)] hover:text-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] transition-all cursor-pointer text-left font-bold"
              >
                10 CR • Full Review
              </button>
              <button
                type="button"
                onClick={() => handleSendPrompt("Check Tier Gate status")}
                className="w-full py-2 px-3 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--accent-gold)] hover:text-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] transition-all cursor-pointer text-left font-bold"
              >
                10 CR • Tier Gate Status
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[10px] text-[var(--text-muted)] space-y-1">
            <div className="flex items-center gap-1 text-[var(--accent-gold)] font-bold">
              <Lock className="w-3 h-3" />
              <span>TIER MASKING ACTIVE</span>
            </div>
            <p>Pricing remains strictly hidden prior to outreach.</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between h-full bg-[var(--bg-canvas)] p-4 md:p-6 overflow-hidden">
          <div
            ref={chatStreamRef}
            className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--accent-gold)] shrink-0">
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold rounded-tr-none"
                      : "bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="text-[11.5px]">{msg.text}</p>
                  <span
                    className={`text-[8.5px] block mt-1.5 text-right opacity-70 ${
                      msg.sender === "user"
                        ? "text-[var(--bg-canvas)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isAuditing && (
              <div className="flex items-center gap-2 text-[var(--accent-gold)] text-[11px] p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reviewing prototype layout...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-2xl shadow-lg"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask Vesper about ${activeLeadName}...`}
              className="flex-1 bg-transparent px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isAuditing}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold uppercase hover:bg-[var(--accent-gold-hover)] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Audit</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
