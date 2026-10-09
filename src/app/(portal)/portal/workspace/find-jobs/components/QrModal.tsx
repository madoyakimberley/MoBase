"use client";

import { QrCode, X, Check } from "lucide-react";

interface QrModalProps {
  qrCodeData: string | null;
  isWhatsAppConnected: boolean;
  onClose: () => void;
}

// Skeleton Loader for QR Box (NO SPINNER)
function QrSkeleton() {
  return (
    <div className="w-48 h-48 bg-[var(--bg-canvas)] animate-pulse rounded-2xl border border-[var(--border-glass)] flex flex-col items-center justify-center p-4 space-y-3">
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-elevated)] animate-pulse" />
      <div className="w-28 h-3 bg-[var(--bg-surface-elevated)] animate-pulse rounded" />
      <div className="w-20 h-2 bg-[var(--bg-surface-elevated)] animate-pulse rounded" />
    </div>
  );
}

export function QrModal({
  qrCodeData,
  isWhatsAppConnected,
  onClose,
}: QrModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
          <div className="flex items-center gap-2 text-[var(--accent-gold)]">
            <QrCode className="w-5 h-5" />
            <h3 className="font-serif text-lg text-[var(--text-primary)]">
              Link WhatsApp Account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-[var(--text-secondary)]">
          <p>1. Open WhatsApp on your primary phone</p>
          <p>
            2. Go to <b>Settings &rarr; Linked Devices</b>
          </p>
          <p>
            3. Tap <b>Link a Device</b> and scan the code below:
          </p>
        </div>

        {/* QR Display / Skeleton State */}
        <div className="flex items-center justify-center p-4 bg-white rounded-2xl w-56 h-56 mx-auto border shadow-inner">
          {qrCodeData ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                qrCodeData,
              )}`}
              alt="WhatsApp Web QR Code"
              className="w-full h-full object-contain"
            />
          ) : isWhatsAppConnected ? (
            <div className="text-emerald-600 font-bold text-xs flex flex-col items-center gap-2">
              <Check className="w-8 h-8" />
              <span>WhatsApp Connected!</span>
            </div>
          ) : (
            <QrSkeleton />
          )}
        </div>

        <p className="text-[11px] text-[var(--text-muted)] font-mono">
          Session keys remain encrypted locally. Scan once to maintain a
          persistent proxy session.
        </p>
      </div>
    </div>
  );
}
