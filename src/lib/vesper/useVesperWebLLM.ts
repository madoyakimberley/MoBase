"use client";

import { useState, useCallback, useRef } from "react";
import { getOrInitializeCredits, deductCredits } from "./creditVault";
import { vesperDb, VesperAuditRecord } from "./vesperLocalDb";
import { validateInputGuardrails } from "./vesperGuardrails";
import { fetchBrowserOSINT, OSINTIntelReport } from "./vesperOSINT";
import {
  VESPER_EXECUTIVE_SYSTEM_PROMPT,
  VESPER_PROPOSAL_PROMPT,
  VESPER_PLAIN_ENGLISH_PROMPT,
  generateDesignBriefAndTokens,
} from "./vesperPrompts";

const SELECTED_MODEL = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

export function useVesperWebLLM() {
  const [engine, setEngine] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<number>(1000);
  const isMounted = useRef(true);

  const syncCredits = useCallback(async () => {
    const balance = await getOrInitializeCredits();
    setCredits(balance);
  }, []);

  const initializeEngine = useCallback(async () => {
    if (engine || isInitializing) return;
    setIsInitializing(true);
    setLoadingProgress("Connecting Vesper Engine...");

    try {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

      const mlcEngine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (progress) => {
          if (isMounted.current) {
            setLoadingProgress(progress.text);
          }
        },
      });

      setEngine(mlcEngine);
      setIsReady(true);
      setLoadingProgress("Vesper Active");
      await syncCredits();
    } catch (err: any) {
      console.error("Engine Init Error:", err);
      setLoadingProgress(err?.message || "Local browser engine unavailable.");
    } finally {
      setIsInitializing(false);
    }
  }, [engine, isInitializing, syncCredits]);

  // Multi-turn Conversation Brain
  const askVesperStream = async (
    conversationHistory: Array<{ sender: "user" | "vesper"; text: string }>,
    leadName: string = "Target Client",
    devName: string = "Developer",
  ): Promise<string> => {
    if (!engine) throw new Error("Vesper AI Engine is not initialized.");

    const now = new Date();
    const nyTime = now.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const localTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const systemHeader = `${VESPER_EXECUTIVE_SYSTEM_PROMPT}
DEVELOPER NAME: ${devName}
CLIENT CONTEXT: ${leadName}
CURRENT SYSTEM TIME: ${localTime}
NEW YORK TIME: ${nyTime}
REMINDER: The human user's name is ${devName}. You are Vesper. Do NOT call ${devName} "Vesper".`;

    const formattedMessages = [
      { role: "system", content: systemHeader },
      ...conversationHistory.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    setIsGenerating(true);
    try {
      const response = await engine.chat.completions.create({
        messages: formattedMessages,
        temperature: 0.3,
        max_tokens: 200,
      });

      return (
        response.choices[0]?.message?.content ||
        `I'm right here ${devName}. What are we tackling next for ${leadName}?`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 1. Audit Lead Execution
  const runAudit = async (lead: {
    id: string;
    name: string;
    category?: string;
    city?: string;
    reviewsCount?: number;
    hasWebsite?: boolean;
    domainUrl?: string;
  }): Promise<VesperAuditRecord | null> => {
    if (!engine) throw new Error("Vesper AI Engine is not initialized.");

    const guard = validateInputGuardrails(
      `${lead.name} ${lead.category || ""}`,
    );
    if (!guard.passed) throw new Error(guard.reason);

    const osint: OSINTIntelReport = await fetchBrowserOSINT(lead.domainUrl);

    const remaining = await deductCredits(10);
    setCredits(remaining);
    setIsGenerating(true);

    try {
      const userPrompt = `Audit Lead Context:
Name: ${lead.name}
Niche: ${lead.category || "Local Business"}
Location: ${lead.city || "Nairobi"}
Reviews: ${lead.reviewsCount || 0}
Has Website: ${lead.hasWebsite ? "Yes" : "No"}
OSINT Domain Exposure: ${osint.dnsExposure}
Obsolescence Index: ${osint.digitalObsolescenceScore}%

Return ONLY raw JSON matching this schema without markdown:
{
  "assignedTier": "TIER_ALPHA_01" | "TIER_BETA_02" | "TIER_GAMMA_03",
  "suggestedPriceUSD": number,
  "confidenceScore": number,
  "riskFactors": string[],
  "valueDrivers": string[],
  "summary": string
}`;

      const response = await engine.chat.completions.create({
        messages: [
          { role: "system", content: VESPER_EXECUTIVE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      const rawText = response.choices[0]?.message?.content || "";
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const auditRecord: VesperAuditRecord = {
        id: crypto.randomUUID(),
        leadId: lead.id,
        leadName: lead.name,
        assignedTier: parsed.assignedTier || "TIER_ALPHA_01",
        suggestedPriceUSD: parsed.suggestedPriceUSD || 2500,
        confidenceScore: parsed.confidenceScore || 92,
        riskFactors: Array.isArray(parsed.riskFactors)
          ? parsed.riskFactors
          : [osint.dnsExposure],
        valueDrivers: Array.isArray(parsed.valueDrivers)
          ? parsed.valueDrivers
          : ["High direct conversion potential"],
        summary: parsed.summary || "Executive assessment completed.",
        createdAt: new Date().toISOString(),
      };

      await vesperDb.audits.put(auditRecord);
      return auditRecord;
    } catch (err) {
      console.error("Vesper Audit Error:", err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Proposal Generator
  const generateProposal = async (
    leadName: string,
    tier: string,
    price: number,
    vulnerabilities: string[],
  ): Promise<string> => {
    if (!engine) throw new Error("Vesper AI Engine is not initialized.");

    const guard = validateInputGuardrails(leadName);
    if (!guard.passed) throw new Error(guard.reason);

    const remaining = await deductCredits(10);
    setCredits(remaining);
    setIsGenerating(true);

    try {
      const userPrompt = `Generate an Executive Proposal for:
Client: ${leadName}
Assigned Tier Gate: ${tier}
Gaps Identified: ${vulnerabilities.join(", ")}`;

      const response = await engine.chat.completions.create({
        messages: [
          { role: "system", content: VESPER_PROPOSAL_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 450,
      });

      return (
        response.choices[0]?.message?.content || "Proposal generation failed."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Direct Outreach Message Generator
  const generateOutreachMessage = async (
    leadName: string,
    vulnerability: string,
  ): Promise<string> => {
    if (!engine) throw new Error("Vesper AI Engine is not initialized.");

    const remaining = await deductCredits(5);
    setCredits(remaining);
    setIsGenerating(true);

    try {
      const userPrompt = `Lead: ${leadName}. Identified Gap: ${vulnerability}`;

      const response = await engine.chat.completions.create({
        messages: [
          { role: "system", content: VESPER_PLAIN_ENGLISH_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 150,
      });

      return (
        response.choices[0]?.message?.content ||
        "Outreach script generation failed."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Download Design Tokens & PRD Files
  const exportDesignSpecs = (lead: {
    name: string;
    category?: string;
    assignedTier?: string;
    suggestedPriceUSD?: number;
  }) => {
    const { jsonTokens, markdownPRD } = generateDesignBriefAndTokens(lead);

    const prdBlob = new Blob([markdownPRD], { type: "text/markdown" });
    const prdUrl = URL.createObjectURL(prdBlob);
    const prdLink = document.createElement("a");
    prdLink.href = prdUrl;
    prdLink.download = `${lead.name.toLowerCase().replace(/\s+/g, "_")}_prd.md`;
    prdLink.click();

    const tokenBlob = new Blob([JSON.stringify(jsonTokens, null, 2)], {
      type: "application/json",
    });
    const tokenUrl = URL.createObjectURL(tokenBlob);
    const tokenLink = document.createElement("a");
    tokenLink.href = tokenUrl;
    tokenLink.download = `${lead.name.toLowerCase().replace(/\s+/g, "_")}_tokens.json`;
    tokenLink.click();
  };

  return {
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
    syncCredits,
  };
}
