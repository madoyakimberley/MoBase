"use client";

import { useState } from "react";
import {
  Download,
  Globe,
  ExternalLink,
  Edit2,
  Check,
  X,
  CheckCircle2,
  Phone,
} from "lucide-react";

export interface ClientDetailsData {
  id: string;
  name: string;
  category?: string;
  reviewsCount?: number;
  hasWebsite?: boolean;
  liveUrl?: string;
  projectUrl?: string;
  maskedPhone?: string;
  phone?: string;
  realPhoneNumber?: string;
  status?: string;
}

interface ClientDetailsProps {
  client: ClientDetailsData;
  onUpdateClient?: (updated: ClientDetailsData) => void;
}

export function ClientDetails({ client, onUpdateClient }: ClientDetailsProps) {
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(
    client.liveUrl || client.projectUrl || "",
  );
  const [savingUrl, setSavingUrl] = useState(false);

  const activeProjectUrl = client.liveUrl || client.projectUrl;

  const handleSaveProjectUrl = async () => {
    setSavingUrl(true);
    try {
      const res = await fetch("/api/dev/leads/project-url", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: client.id,
          projectUrl: urlInput,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const updatedClient = {
          ...client,
          liveUrl: data.projectUrl || urlInput,
          projectUrl: data.projectUrl || urlInput,
        };
        if (onUpdateClient) onUpdateClient(updatedClient);
        setIsEditingUrl(false);
      } else {
        alert(data.error || "Failed to update project URL.");
      }
    } catch (err) {
      console.error("Failed to save project URL:", err);
    } finally {
      setSavingUrl(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
      {/* Header Box */}
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border-glass)] pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--accent-gold)] font-mono font-bold flex items-center justify-center text-base shrink-0">
            {getInitials(client.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                {client.name}
              </h2>
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
            </div>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
              Category: {client.category || "Local Business"} • Status:{" "}
              {client.status || "CLAIMED"}
            </p>
          </div>
        </div>
      </div>

      {/* Deployed Live URL Box */}
      <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-glass)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--accent-gold)] font-bold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Deployed Website Prototype
          </span>

          {!isEditingUrl && (
            <button
              onClick={() => {
                setUrlInput(activeProjectUrl || "");
                setIsEditingUrl(true);
              }}
              type="button"
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>
                {activeProjectUrl ? "Edit Link" : "Attach Website Link"}
              </span>
            </button>
          )}
        </div>

        {isEditingUrl ? (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste deployed URL (e.g. https://client-demo.vercel.app)..."
              className="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
            />
            <button
              onClick={handleSaveProjectUrl}
              disabled={savingUrl}
              type="button"
              className="p-2 bg-[var(--accent-gold)] text-[var(--bg-canvas)] rounded-lg hover:bg-[var(--accent-gold-hover)] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditingUrl(false)}
              type="button"
              className="p-2 bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : activeProjectUrl ? (
          <a
            href={activeProjectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-semibold text-[var(--accent-gold)] hover:underline flex items-center gap-1.5 truncate pt-0.5"
          >
            <span className="truncate">{activeProjectUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        ) : (
          <span className="text-xs font-mono text-[var(--text-muted)] italic block pt-0.5">
            No live project URL attached yet. Click &quot;Attach Website
            Link&quot; above to link one.
          </span>
        )}
      </div>

      {/* Dynamic Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
        <div className="space-y-1">
          <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)] block">
            Google Reviews
          </span>
          <span className="font-semibold text-[var(--text-primary)] block">
            {client.reviewsCount || 0} Verified Reviews
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)] block">
            Original Website
          </span>
          <span className="font-semibold text-[var(--text-primary)] block">
            {client.hasWebsite ? "Has Existing Site" : "No Website Found"}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)] block">
            Contact Number
          </span>
          <span className="font-semibold text-[var(--accent-gold)] block">
            {client.maskedPhone || client.phone || "Protected"}
          </span>
        </div>
      </div>
    </div>
  );
}
