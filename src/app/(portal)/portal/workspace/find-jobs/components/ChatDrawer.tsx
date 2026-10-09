"use client";

import { useState, useEffect } from "react";
import { Lock, X, Bot, Send, Check, CheckCheck } from "lucide-react";
import { Lead, Message } from "./types";

interface ChatDrawerProps {
  activeLead: Lead;
  isWhatsAppConnected: boolean;
  onClose: () => void;
  onOpenQrModal: () => void;
  onStatusUpdate: (leadId: string, status: "CONTACTED") => void;
}

// Read Receipt Icon Helper

function ReadReceipt({ status }: { status?: Message["status"] }) {
  if (!status || status === "PENDING") {
    return (
      <span
        title="Sent (Pending Delivery)"
        className="inline-flex items-center"
      >
        <Check className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </span>
    );
  }
  if (status === "SENT" || status === "DELIVERED") {
    return (
      <span title="Delivered to Client" className="inline-flex items-center">
        <CheckCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </span>
    );
  }
  if (status === "READ") {
    return (
      <span title="Read by Client" className="inline-flex items-center">
        <CheckCheck className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
      </span>
    );
  }
  return null;
}

// Skeleton Loader for Chat History (NO SPINNER)
function ChatHistorySkeleton() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col items-start space-y-1">
        <div className="w-3/4 h-10 bg-[var(--bg-surface-elevated)] animate-pulse rounded-2xl rounded-bl-none border border-[var(--border-glass)]" />
        <div className="w-16 h-2 bg-[var(--bg-surface-elevated)] animate-pulse rounded" />
      </div>
      <div className="flex flex-col items-end space-y-1">
        <div className="w-2/3 h-12 bg-[var(--accent-gold)]/20 animate-pulse rounded-2xl rounded-br-none border border-[var(--accent-gold)]/30" />
        <div className="w-12 h-2 bg-[var(--bg-surface-elevated)] animate-pulse rounded" />
      </div>
      <div className="flex flex-col items-start space-y-1">
        <div className="w-1/2 h-8 bg-[var(--bg-surface-elevated)] animate-pulse rounded-2xl rounded-bl-none border border-[var(--border-glass)]" />
      </div>
    </div>
  );
}

export function ChatDrawer({
  activeLead,
  isWhatsAppConnected,
  onClose,
  onOpenQrModal,
  onStatusUpdate,
}: ChatDrawerProps) {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Fetch chat history from DB & poll every 2.5s
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `/api/dev/leads/chat/messages?leadId=${encodeURIComponent(
            activeLead.id,
          )}`,
        );
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (isMounted) {
            setChatMessages(data.messages || []);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeLead.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (!isWhatsAppConnected) {
      onOpenQrModal();
      return;
    }

    const userText = messageInput;
    setMessageInput("");
    setSendingMsg(true);

    // Optimistic UI insert with PENDING single tick status
    const tempMsg: Message = {
      id: Date.now().toString(),
      senderType: "DEVELOPER",
      messageText: userText,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/dev/leads/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: activeLead.id,
          messageText: userText,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch message.");
      }

      onStatusUpdate(activeLead.id, "CONTACTED");
    } catch (err: any) {
      alert(err.message || "Could not route message.");
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col justify-between p-6 shadow-2xl relative">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-glass)] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-semibold mb-1">
              <Lock className="w-3 h-3" /> SECURE PROXY ROUTE ACTIVE
            </div>
            <h3 className="font-serif text-xl text-[var(--text-primary)]">
              {activeLead.name}
            </h3>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Masked Contact: {activeLead.maskedPhone}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 py-4 overflow-y-auto space-y-3 pr-1">
          {loadingHistory ? (
            <ChatHistorySkeleton />
          ) : chatMessages.length === 0 ? (
            <div className="text-center py-16 text-xs text-[var(--text-muted)] space-y-3">
              <Bot className="w-10 h-10 mx-auto text-[var(--accent-gold)] opacity-70" />
              <div className="space-y-1">
                <p className="font-medium text-[var(--text-primary)]">
                  Start Outreach to {activeLead.name}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] max-w-xs mx-auto">
                  Messages sent here route directly via your WhatsApp worker
                  bridge while your personal number stays hidden.
                </p>
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.senderType === "DEVELOPER" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed relative group ${
                    msg.senderType === "DEVELOPER"
                      ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] rounded-br-none font-medium"
                      : "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-glass)]"
                  }`}
                >
                  <p>{msg.messageText}</p>

                  {/* Timestamp & Read Receipt Tick Bar */}
                  {msg.senderType === "DEVELOPER" && (
                    <div className="flex items-center justify-end gap-1 mt-1 opacity-90 text-[10px]">
                      <span>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                      <ReadReceipt status={msg.status} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="pt-4 border-t border-[var(--border-glass)] flex items-center gap-2"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type outreach message..."
            className="flex-1 px-4 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-glass)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
            required
          />
          <button
            type="submit"
            disabled={sendingMsg}
            className="p-2.5 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
