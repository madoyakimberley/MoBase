import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import http from "http";
import { Client, Message } from "whatsapp-web.js";
import * as qrcode from "qrcode-terminal";
import { db } from "../src/db";
import { leads, messages, systemStatus } from "../src/db/schema";
import { eq, or, and } from "drizzle-orm";

const SESSION_ID = "whatsapp-session";
const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

if (!BROWSERLESS_KEY) {
  console.error("❌ BROWSERLESS_API_KEY is missing in environment variables.");
  process.exit(1);
}

// --------------------------------------------------------------------------
// 1. Embedded HTTP Health Check Server (Keeps Render Instance Awake)
// --------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "online",
          service: "MoBase WhatsApp Cloud Worker",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }
    res.writeHead(404);
    res.end();
  })
  .listen(PORT, () => {
    console.log(`[KEEP-ALIVE] HTTP server active on port ${PORT}`);
  });

// --------------------------------------------------------------------------
// 2. WhatsApp Web Client over Browserless.io
// --------------------------------------------------------------------------
const client = new Client({
  puppeteer: {
    browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    ],
  },
});

// QR Code Event Listener
client.on("qr", async (qr: string) => {
  console.log("\nScan this QR code with WhatsApp on your phone:\n");
  qrcode.generate(qr, { small: true });

  try {
    await db
      .insert(systemStatus)
      .values({
        id: SESSION_ID,
        qrCode: qr,
        isConnected: false,
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: { qrCode: qr, isConnected: false, updatedAt: new Date() },
      });
    console.log("[QR] Synced QR code to database for live website.");
  } catch (err) {
    console.error("Error updating QR code in database:", err);
  }
});

// Session Ready Event Listener
client.on("ready", async () => {
  console.log("✅ WhatsApp Web session active and ready!");

  try {
    await db
      .insert(systemStatus)
      .values({
        id: SESSION_ID,
        qrCode: null,
        isConnected: true,
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: { qrCode: null, isConnected: true, updatedAt: new Date() },
      });
    console.log("[SESSION] Connected status synced to database.");
  } catch (err) {
    console.error("Error updating connection status in database:", err);
  }

  startOutboxPolling();
});

// Inbound Message Handler
client.on("message", async (msg: Message) => {
  if (
    msg.fromMe ||
    msg.from.includes("@g.us") ||
    msg.from === "status@broadcast"
  ) {
    return;
  }

  const rawPhone = msg.from.replace(/\D/g, "");
  const textContent = msg.body;

  if (!rawPhone || !textContent) return;

  try {
    const [matchingLead] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(or(eq(leads.phone, rawPhone), eq(leads.realPhoneNumber, rawPhone)))
      .limit(1);

    if (!matchingLead) return;

    await db.insert(messages).values({
      id: crypto.randomUUID(),
      leadId: matchingLead.id,
      senderType: "CLIENT",
      messageText: textContent,
      status: "DELIVERED",
      createdAt: new Date(),
    });

    console.log(`[INBOUND] Received reply from +${rawPhone}`);
  } catch (err) {
    console.error("Error saving inbound message:", err);
  }
});

// --------------------------------------------------------------------------
// 3. Resilient Non-Overlapping Outbound Poller
// --------------------------------------------------------------------------
let isPolling = false;

async function pollOutboxQueue(): Promise<void> {
  if (isPolling) return;
  isPolling = true;

  try {
    const pendingMessages = await db
      .select({
        id: messages.id,
        leadId: messages.leadId,
        messageText: messages.messageText,
        phone: leads.phone,
        maskedPhone: leads.maskedPhone,
        realPhoneNumber: leads.realPhoneNumber,
      })
      .from(messages)
      .innerJoin(leads, eq(messages.leadId, leads.id))
      .where(
        and(
          eq(messages.senderType, "DEVELOPER"),
          eq(messages.status, "PENDING"),
        ),
      )
      .limit(5);

    for (const msg of pendingMessages) {
      const rawPhone =
        msg.phone || msg.realPhoneNumber || msg.maskedPhone || "";
      const targetPhone = rawPhone.replace(/\D/g, "");

      if (!targetPhone) continue;

      await client.sendMessage(`${targetPhone}@c.us`, msg.messageText);

      await db
        .update(messages)
        .set({ status: "SENT" })
        .where(eq(messages.id, msg.id));

      await db
        .update(leads)
        .set({ status: "CONTACTED" })
        .where(eq(leads.id, msg.leadId));

      console.log(`[OUTBOUND] Dispatched message to +${targetPhone}`);
    }
  } catch (err: any) {
    console.error("[OUTBOX POLL NOTICE]:", err?.message || err);
  } finally {
    isPolling = false;
    setTimeout(pollOutboxQueue, 5000);
  }
}

function startOutboxPolling(): void {
  console.log("[OUTBOX] Starting resilient outbox queue poller...");
  pollOutboxQueue();
}

client.initialize();
