"use client";

import React from "react";
import { motion } from "framer-motion";
import { VesperLogo } from "./VesperLogo";

interface VesperCoreProps {
  isExpanded: boolean;
  onClick: () => void;
  credits?: number;
}

export const VesperCore: React.FC<VesperCoreProps> = ({
  isExpanded,
  onClick,
}) => {
  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer Static Orbit Ring */}
      <div className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] rounded-full border border-[var(--border-subtle)] pointer-events-none opacity-40" />

      {/* Outer Dashed Orbit Ring */}
      <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] rounded-full border border-dashed border-[var(--accent-gold)]/30 pointer-events-none" />

      {/* Lightweight Hardware-Accelerated Aura */}
      <motion.div
        animate={
          isExpanded
            ? { scale: 1.2, opacity: 0.5 }
            : { scale: [1, 1.04, 1], opacity: [0.15, 0.3, 0.15] }
        }
        transition={
          isExpanded
            ? { duration: 0.3 }
            : { repeat: Infinity, duration: 4, ease: "easeInOut" }
        }
        className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-[var(--accent-gold)]/20 blur-xl pointer-events-none transform-gpu"
      />

      {/* Center Interactive Vesper Emblem */}
      <div
        onClick={onClick}
        className="relative z-20 flex flex-col items-center group cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isExpanded ? { scale: 0.92 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-[28px] sm:rounded-[36px] bg-[var(--card-bg)] p-[2px] border border-[var(--border-subtle)] shadow-2xl transition-colors duration-200 group-hover:border-[var(--accent-gold)] transform-gpu"
        >
          <div className="w-full h-full rounded-[26px] sm:rounded-[34px] border border-[var(--border-glass)] flex items-center justify-center p-3 sm:p-5 bg-[var(--bg-surface-elevated)]/70 relative overflow-hidden">
            <VesperLogo size="100%" />
          </div>
        </motion.div>

        {/* Status Text Under Core Emblem */}
        <div className="mt-4 text-center select-none pointer-events-none">
          <h2 className="text-xs sm:text-sm font-serif font-bold tracking-[0.3em] text-[var(--text-primary)] uppercase group-hover:text-[var(--accent-gold)] transition-colors">
            VESPER CORE
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1 text-[10px] font-mono tracking-[0.2em] text-[var(--accent-gold)]">
            <span className="font-bold">{isExpanded ? "ARMED" : "ONLINE"}</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[var(--text-secondary)]">SLA ENCLAVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
