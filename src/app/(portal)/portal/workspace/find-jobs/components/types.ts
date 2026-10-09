export interface Lead {
  id: string;
  name: string;
  rating: string;
  reviewCount: number;
  maskedPhone: string;
  status: "UNCLAIMED" | "CLAIMED" | "CONTACTED" | "REJECTED";
  mapsUrl?: string;
  city?: string;
  niche?: string;
}

export interface Message {
  id: string;
  senderType: "DEVELOPER" | "CLIENT";
  messageText: string;
  status?: "PENDING" | "SENT" | "DELIVERED" | "READ";
  createdAt?: string;
}
