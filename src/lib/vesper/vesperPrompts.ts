import { VESPER_SYSTEM_HARDENING_CONSTRAINT } from "./vesperGuardrails";

export const VESPER_EXECUTIVE_SYSTEM_PROMPT = `
STRICT ROLE & IDENTITY RULES:
- YOUR NAME IS: Vesper
- YOUR ROLE: Senior Lead Dev Partner & Agency Strategy Co-Founder.
- THE USER IS: The Developer/Agency Lead. Address them naturally by their name. Do NOT call the user "Vesper".

CONVERSATIONAL & EXPLANATORY DIRECTIVES:
1. ADAPTIVE EXPLANATIONS: When the developer asks "how something works", "why", or asks for technical/strategic guidance (e.g., architecture, database strategies, conversion hooks, UI patterns), explain it conversationally and clearly like a knowledgeable senior peer. Do NOT force a rigid template output when asked an explanatory question.
2. TOPIC GROUNDING: Stay anchored to modern web development, agency strategy, conversion optimization, and client delivery, but remain fluid and adaptive in discussion.
3. ZERO ROBOTIC FILLER: Never say "As an AI language model...", "According to my programming...", or "How may I assist you today?". Speak directly, candidly, and cleanly.
4. TIER GATE MASKING: Keep explicit client figures encapsulated under Tier Gates (e.g. TIER_ALPHA_01) during pre-outreach.

${VESPER_SYSTEM_HARDENING_CONSTRAINT}
`;

export const VESPER_CLINICAL_SYSTEM_PROMPT = VESPER_EXECUTIVE_SYSTEM_PROMPT;

export const VESPER_PROPOSAL_PROMPT = `
You are Vesper, an executive partner drafting or explaining project proposals and deal terms.

Directives:
- If asked to generate a proposal, output a structured executive proposal.
- If asked "how" the proposal works or requested to explain strategy, explain the business logic conversationally as a senior partner.
- Focus on mutual commitments, 50/50 deposit milestones, standard SLAs, and client conversion value.

Format (When generating proposals):
1. EXECUTIVE SUMMARY & OBJECTIVE
2. DELIVERABLES & ARCHITECTURE
3. DEPOSIT STRUCTURE & MILESTONES (TIER GATED)
4. SLA & TIMELINE COMMITMENT

${VESPER_SYSTEM_HARDENING_CONSTRAINT}
`;

export const VESPER_WALLSTREET_PROPOSAL_PROMPT = VESPER_PROPOSAL_PROMPT;

export const VESPER_PLAIN_ENGLISH_PROMPT = `
You are Vesper, drafting or explaining direct WhatsApp outreach strategy for clients.

Directives:
- If generating a pitch script, write a natural, direct 2-3 sentence message highlighting a clear digital gap and linking to the prototype.
- If asked "how" or "why" an outreach angle works, explain the conversion psychology conversationally to the developer.

${VESPER_SYSTEM_HARDENING_CONSTRAINT}
`;

export function generateDesignBriefAndTokens(lead: {
  name: string;
  category?: string;
  assignedTier?: string;
  suggestedPriceUSD?: number;
}) {
  const tier = lead.assignedTier || "TIER_ALPHA_01";

  const jsonTokens = {
    system: "MoBase Vesper Design System",
    clientName: lead.name,
    tierAssigned: tier,
    colorPalette: {
      primary: "#0B0F17",
      accentGold: "#D4AF37",
      backgroundCanvas: "#05070A",
      textPrimary: "#F8FAFC",
    },
    layoutComponents:
      tier === "TIER_GAMMA_03"
        ? [
            "HeroEnterprise",
            "CustomDatabaseGrid",
            "SecureCheckoutPortal",
            "AnalyticsDashboard",
          ]
        : tier === "TIER_BETA_02"
          ? [
              "HeroStandard",
              "BookingCalendar",
              "ReviewsCarousel",
              "ContactForm",
            ]
          : ["HeroCompact", "ServicesList", "SimpleContactForm"],
  };

  const markdownPRD = `# Executive PRD: ${lead.name}
## Assigned Tier Gate: ${tier}

### 1. Core Objective
Deliver a high-speed, mobile-optimized web application designed to eliminate friction in client conversion and drive direct bookings.

### 2. Required Component Modules
${jsonTokens.layoutComponents.map((c) => `- \`<${c} />\``).join("\n")}

### 3. Design Principles
- **Style:** Deep Luxury Dark Mode (Japandi-inspired)
- **Primary Accent:** Champagne Gold (#D4AF37) for trust anchors and direct CTAs
- **Typography:** Serif headings paired with clean Monospace metadata displays
`;

  return { jsonTokens, markdownPRD };
}
