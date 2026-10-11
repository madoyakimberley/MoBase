import dotenv from "dotenv";
import { Client, Message } from "whatsapp-web.js";
import * as qrcode from "qrcode-terminal";
import { db } from "../src/db";
import { leads, messages, systemStatus } from "../src/db/schema";
import { eq, or, and } from "drizzle-orm";

dotenv.config();

const SESSION_ID = "whatsapp-session";
const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

if (!BROWSERLESS_KEY) {
  console.error("❌ BROWSERLESS_API_KEY is missing in environment variables.");
  process.exit(1);
}

// Connect persistent Node process to Browserless Cloud Chrome
const client = new Client({
  puppeteer: {
    browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`,
  },
});

// 1. Sync QR Code to Terminal & Database
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

// 2. Scan Success Handshake
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

// 3. Inbound Interceptor
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

// 4. Outbound Outbox Queue
function startOutboxPolling(): void {
  setInterval(async () => {
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

        console.log(`[OUTBOUND] Sent message to +${targetPhone}`);
      }
    } catch (err) {
      console.error("Error processing outbox queue:", err);
    }
  }, 3000);
}

client.initialize();
