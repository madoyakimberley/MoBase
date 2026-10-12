"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Briefcase, Send, Bot, ChevronRight } from "lucide-react";

interface RadialModulesProps {
  onSelectAudit: () => void;
  onSelectProposal: () => void;
  onSelectOutreach: () => void;
  onSelectChat: () => void;
}

export const RadialModules: React.FC<RadialModulesProps> = ({
  onSelectAudit,
  onSelectProposal,
  onSelectOutreach,
  onSelectChat,
}) => {
  const modules = [
    {
      id: "outreach",
      directive: "DIRECTIVE // 01",
      tag: "OUTREACH",
      isTagAccent: true,
      title: "Outreach Generator",
      desc: "WhatsApp Pitch Scripts & Direct Client Engagement Strategy.",
      cost: "5 CREDITS",
      status: "ACTIVE PITCH",
      icon: Send,
      coords: { x: -260, y: 0 }, // Left
      onClick: onSelectOutreach,
    },
    {
      id: "audit",
      directive: "DIRECTIVE // 02",
      tag: "AUDIT ENGINE",
      title: "Run Audit Module",
      desc: "Prototype Surface Inspection & Tier Gate Valuation.",
      cost: "10 CREDITS",
      status: "INSPECTION READY",
      icon: ShieldCheck,
      coords: { x: 0, y: -210 }, // Top
      onClick: onSelectAudit,
    },
    {
      id: "chat",
      directive: "DIRECTIVE // 03",
      tag: "AI ADVISORY",
      title: "Ask Vesper AI",
      desc: "Executive Advisory, Design Direction & Account Strategy.",
      cost: "INTERACTIVE CHAT",
      status: "EXECUTIVE CHAT",
      icon: Bot,
      coords: { x: 0, y: 210 }, // Bottom
      onClick: onSelectChat,
    },
    {
      id: "proposal",
      directive: "DIRECTIVE // 04",
      tag: "PROPOSAL",
      title: "Proposal Generator",
      desc: "Client Term Sheets, Escrow Deposit Terms & SLA Agreements.",
      cost: "10 CREDITS",
      status: "TERM SHEET DRAFT",
      icon: Briefcase,
      coords: { x: 260, y: 0 }, // Right
      onClick: onSelectProposal,
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30 scale-[0.62] xs:scale-75 sm:scale-85 md:scale-95 lg:scale-100 transition-transform">
      {modules.map((mod, index) => {
        const Icon = mod.icon;
        return (
          <motion.article
            key={mod.id}
            onClick={mod.onClick}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
            animate={{ x: mod.coords.x, y: mod.coords.y, scale: 1, opacity: 1 }}
            exit={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
              delay: index * 0.05,
            }}
            whileHover={{ scale: 1.04 }}
            className="pointer-events-auto absolute flex flex-col justify-between p-4 sm:p-5 w-64 sm:w-72 rounded-2xl bg-[var(--card-bg)]/90 border border-[var(--border-subtle)] backdrop-blur-2xl transition-all shadow-2xl cursor-pointer hover:border-[var(--accent-gold)] group"
          >
            {/* Directive Header Bar */}
            <div className="flex items-center justify-between text-[9px] font-mono tracking-widest mb-3">
              <span className="text-[var(--text-muted)] font-bold">
                {mod.directive}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-wider ${
                  mod.isTagAccent
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] border border-[var(--border-glass)]"
                }`}
              >
                {mod.tag}
              </span>
            </div>

            {/* Centered Icon Badge */}
            <div className="flex justify-center my-1">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--accent-gold)] group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center my-2 space-y-1">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)]">
                {mod.title}
              </h3>
              <p className="text-[10.5px] font-mono text-[var(--text-secondary)] leading-relaxed min-h-[32px]">
                {mod.desc}
              </p>
            </div>

            {/* Bottom Row: Cost & Status */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-glass)] text-[10px] font-mono">
              <div className="flex items-center gap-1 font-bold text-[var(--accent-gold)]">
                <span>{mod.cost}</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[8.5px] text-[var(--text-muted)] tracking-widest uppercase">
                {mod.status}
              </span>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};
