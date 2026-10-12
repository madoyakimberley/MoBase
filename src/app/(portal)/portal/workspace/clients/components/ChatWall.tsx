"use client";

import { useState, useEffect } from "react";
import { Send, RefreshCw, MessageSquare, Check, Clock } from "lucide-react";
import { Lead } from "../../find-jobs/components/types";

interface MessageRecord {
  id: string;
  senderType: "DEVELOPER" | "CLIENT";
  messageText: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
  createdAt: string;
}

interface ChatWallProps {
  activeLead: Lead;
  onOpenChat: (lead: Lead) => void;
}

export function ChatWall({ activeLead, onOpenChat }: ChatWallProps) {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/dev/messages?leadId=${activeLead.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching lead messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeLead.id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/dev/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: activeLead.id,
          messageText: messageInput.trim(),
        }),
      });

      if (res.ok) {
        setMessageInput("");
        await fetchMessages();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to send message to outbox queue.");
      }
    } catch (err) {
      console.error("Failed to post message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--accent-gold)]" />
          <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
            Live Chat Wall • {activeLead.name}
          </h3>
        </div>
        <button
          onClick={fetchMessages}
          className="p-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {loading && messages.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)]">
            Syncing live WhatsApp messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] text-xs font-mono text-[var(--text-muted)] space-y-1">
            <p>No messages sent yet to {activeLead.name}.</p>
            <p className="text-[10px]">
              Type a message below to dispatch via WhatsApp.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isDev = msg.senderType === "DEVELOPER";
            return (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl text-xs space-y-1 ${
                  isDev
                    ? "bg-[var(--accent-gold)] text-[var(--bg-canvas)] ml-8 shadow-sm"
                    : "bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--text-primary)] mr-8"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] opacity-80">
                  <span className="font-bold">
                    {isDev ? "DEVELOPER (You)" : activeLead.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isDev &&
                      (msg.status === "PENDING" ? (
                        <span title="In Outbox Queue">
                          <Clock className="w-3 h-3 text-amber-900" />
                        </span>
                      ) : (
                        <span title="Dispatched">
                          <Check className="w-3 h-3 text-emerald-950" />
                        </span>
                      ))}
                  </div>
                </div>

                <p className="font-sans leading-relaxed text-xs">
                  {msg.messageText}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-3">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Type message to ${activeLead.name}... (Press Enter to send)`}
          rows={3}
          className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none font-sans"
        />

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-glass)] text-xs font-mono">
          <button
            type="button"
            onClick={() => onOpenChat(activeLead)}
            className="text-[10px] text-[var(--accent-gold)] hover:underline flex items-center gap-1"
          >
            <span>Open WhatsApp Drawer View</span>
          </button>

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={sending || !messageInput.trim()}
            className="px-5 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--bg-canvas)] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <span>{sending ? "Queueing..." : "Send to WhatsApp"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
