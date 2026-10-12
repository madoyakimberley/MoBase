import Dexie, { type Table } from "dexie";

export interface UserProfile {
  id: string; // 'local_dev'
  encryptedCredits: string; // AES Encrypted string
  salt: string;
  updatedAt: string;
}

export interface VesperAuditRecord {
  id: string;
  leadId: string;
  leadName: string;
  assignedTier: "TIER_1" | "TIER_2" | "TIER_3";
  suggestedPriceUSD: number;
  confidenceScore: number;
  riskFactors: string[];
  valueDrivers: string[];
  summary: string;
  createdAt: string;
}

export interface VesperChatMessageRecord {
  id: string;
  leadId: string;
  sender: "user" | "vesper";
  text: string;
  timestamp: string;
  createdAt: string;
}

export class VesperLocalDatabase extends Dexie {
  profiles!: Table<UserProfile>;
  audits!: Table<VesperAuditRecord>;
  chatMessages!: Table<VesperChatMessageRecord>;

  constructor() {
    super("VesperLocalDB");
    this.version(2).stores({
      profiles: "id",
      audits: "id, leadId, assignedTier, createdAt",
      chatMessages: "id, leadId, createdAt",
    });
  }
}

export const vesperDb = new VesperLocalDatabase();
