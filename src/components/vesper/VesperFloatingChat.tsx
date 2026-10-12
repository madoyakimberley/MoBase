"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Bot,
  User,
  Send,
  Building2,
  ChevronRight,
  Smile,
} from "lucide-react";
import { useVesperWebLLM } from "@/lib/vesper/useVesperWebLLM";

interface VesperFloatingChatProps {
  activeLeadContext?: {
    id: string;
    name: string;
    category?: string;
    city?: string;
    reviewsCount?: number;
    hasWebsite?: boolean;
    assignedTier?: string;
    suggestedPriceUSD?: number;
  };
}

interface ChatMessage {
  id: string;
  sender: "user" | "vesper";
  text: string;
  timestamp: string;
}

export function VesperFloatingChat({
  activeLeadContext,
}: VesperFloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [devName, setDevName] = useState<string>("Developer");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    credits,
    isReady,
    isInitializing,
    isGenerating,
    loadingProgress,
    initializeEngine,
    askVesperStream,
    runAudit,
    generateProposal,
    generateOutreachMessage,
    exportDesignSpecs,
  } = useVesperWebLLM();

  const leadName = activeLeadContext?.name || "Active Target Lead";

  // Fetch real developer profile from DB API
  useEffect(() => {
    const fetchRealUserSession = async () => {
      try {
        const res = await fetch("/api/vesper/chat");
        const data = await res.json();
        if (data.success && data.user?.name) {
          setDevName(data.user.name);
        }
      } catch (err) {
        console.error("Failed to load DB user session:", err);
      }
    };

    fetchRealUserSession();
  }, []);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "init_1",
          sender: "vesper",
          text: `Hey ${devName}! I'm looking at ${leadName} with you. What are we tackling today—a WhatsApp pitch, prototype review, or design specs?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [isOpen, devName, leadName, messages.length]);

  // Auto-scroll chat stream
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || inputQuery).trim();
    if (!query || isGenerating) return;

    setErrorMsg("");
    if (!customPrompt) setInputQuery("");

    const userMsgId = `msg_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);

    try {
      if (!isReady) {
        await initializeEngine();
      }

      let responseText = "";
      const lowerQ = query.toLowerCase();

      // Quick Intercepts for Greetings & Presence Checks
      const isPresenceCheck =
        /\b(testing|see if u r there|are you there|u there|u here|you here|is anyone there)\b/i.test(
          lowerQ,
        );
      const isSimpleGreeting =
        /^(hi|hello|hey|yo|sup|hello vesper|hey vesper)\b/i.test(lowerQ) &&
        lowerQ.split(" ").length <= 3;

      // Check if user is explicitly asking "how", "why", or seeking an explanation
      const isExplanatoryQuery =
        /\b(how|why|explain|what is|how do|how does|can you explain)\b/i.test(
          lowerQ,
        );

      if (isPresenceCheck) {
        responseText = `Loud and clear, ${devName}! I'm right here. What are we cooking up for ${leadName}?`;
      } else if (isSimpleGreeting) {
        responseText = `Hey ${devName}! Ready when you are. What's the plan for ${leadName}?`;
      } else if (
        lowerQ.includes("time in new york") ||
        lowerQ.includes("new york time") ||
        lowerQ.includes("time in nyc")
      ) {
        const nyTime = new Date().toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        responseText = `It's currently ${nyTime} in New York City.`;
      } else if (
        !isExplanatoryQuery &&
        (lowerQ === "audit lead" ||
          lowerQ === "audit" ||
          lowerQ === "run audit")
      ) {
        if (!activeLeadContext) {
          responseText = `Select a target client in your workspace first, ${devName}, so I can review their digital footprint.`;
        } else {
          const audit = await runAudit(activeLeadContext);
          if (audit) {
            responseText = `Here is my assessment for ${activeLeadContext.name}:\n• Assigned Gate: ${audit.assignedTier} (Pricing Masked)\n• Match Confidence: ${audit.confidenceScore}%\n\nSummary:\n${audit.summary}`;
          }
        }
      } else if (
        !isExplanatoryQuery &&
        (lowerQ === "draft proposal" ||
          lowerQ === "proposal" ||
          lowerQ === "generate proposal")
      ) {
        responseText = await generateProposal(
          leadName,
          activeLeadContext?.assignedTier || "TIER_ALPHA_01",
          activeLeadContext?.suggestedPriceUSD || 4500,
          ["Missing Active Website", "High Local Traffic"],
        );
      } else if (
        !isExplanatoryQuery &&
        (lowerQ === "draft pitch" || lowerQ === "whatsapp pitch")
      ) {
        responseText = await generateOutreachMessage(
          leadName,
          "Missing website link on verified local business profile.",
        );
      } else {
        // Stream explanatory queries and open-ended technical discussions dynamically through local WebGPU LLM
        responseText = await askVesperStream(
          updatedHistory.map((m) => ({ sender: m.sender, text: m.text })),
          leadName,
          devName,
        );
      }

      const vesperMessage: ChatMessage = {
        id: `vesper_${Date.now()}`,
        sender: "vesper",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, vesperMessage]);
    } catch (err: any) {
      setErrorMsg(err?.message || "Execution failed under local engine rules.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono text-xs select-none">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--accent-gold)] text-[var(--accent-gold)] font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--accent-gold)] group-hover:bg-[var(--accent-gold)] group-hover:text-[var(--bg-canvas)] transition-colors">
            <Bot className="w-4 h-4" />
          </div>
          <span>VESPER AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      ) : (
        <div className="w-[380px] sm:w-[450px] rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col h-[580px] max-h-[85vh] animate-fadeIn text-[var(--text-primary)]">
          {/* Header */}
          <div className="p-3.5 bg-[var(--bg-canvas)] border-b border-[var(--border-glass)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--accent-gold)]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                  <span>VESPER DEV CO-PILOT</span>
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                </h3>
                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                  <Smile className="w-3 h-3 text-[var(--accent-gold)]" />
                  <span>Dev Partner • Hi, {devName}!</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 font-bold">
                {credits} CR
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-3.5 py-2 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-glass)] flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 text-[var(--accent-gold)] font-bold truncate">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{leadName}</span>
            </span>
            <span
              className={`font-bold uppercase tracking-wider ${
                isReady ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isReady ? "SESSION ACTIVE" : "ENGINE UNLOADED"}
            </span>
          </div>

          {/* Chat Stream Area */}
          <div
            ref={chatContainerRef}
            className="p-3.5 space-y-3 overflow-y-auto flex-1 bg-[var(--bg-canvas)]"
          >
            {loadingProgress && (
              <div className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-glass)]">
                {loadingProgress}
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] flex items-start gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--accent-gold)] shrink-0">
                  {msg.sender === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold rounded-tr-none"
                      : "bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="text-[11px]">{msg.text}</p>
                  <span
                    className={`text-[8.5px] block mt-1 text-right opacity-70 ${
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

            {isGenerating && (
              <div className="flex items-center gap-2 text-[var(--accent-gold)] text-[11px] p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="p-2 bg-[var(--bg-surface)] border-t border-[var(--border-glass)] flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              type="button"
              onClick={() => handleSendMessage("Audit lead")}
              className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] hover:border-[var(--accent-gold)] text-[var(--accent-gold)] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Audit Lead</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Draft pitch")}
              className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] hover:border-[var(--accent-gold)] text-[var(--accent-gold)] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Draft Pitch</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Draft proposal")}
              className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] hover:border-[var(--accent-gold)] text-[var(--accent-gold)] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Proposal</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            {activeLeadContext && (
              <button
                type="button"
                onClick={() => exportDesignSpecs(activeLeadContext)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--text-secondary)] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export PRD</span>
              </button>
            )}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[var(--bg-canvas)] border-t border-[var(--border-glass)] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask Vesper about ${leadName}...`}
              className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] font-mono"
            />
            <button
              type="submit"
              disabled={isInitializing || isGenerating}
              className="px-3.5 py-2 rounded-xl bg-[var(--accent-gold)] text-[var(--bg-canvas)] font-bold hover:bg-[var(--accent-gold-hover)] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
