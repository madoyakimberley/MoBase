import dotenv from "dotenv";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import * as qrcode from "qrcode-terminal";
import { db } from "../src/db";
import { leads, messages, systemStatus } from "../src/db/schema";
import { eq, or, and } from "drizzle-orm";

dotenv.config();

const SESSION_ID = "whatsapp-session";

// Initialize WhatsApp Client with High-Speed Puppeteer Arguments
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-component-extensions-with-background-pages",
      "--disable-default-apps",
      "--mute-audio",
      "--no-default-browser-check",
      "--autoplay-policy=user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-notifications",
      "--disable-background-networking",
      "--disable-breakpad",
      "--disable-component-update",
      "--disable-domain-reliability",
      "--disable-hang-monitor",
      "--disable-ipc-flooding-protection",
      "--disable-popup-blocking",
      "--disable-print-preview",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-speech-api",
      "--disable-sync",
    ],
  },
});

// Step 1: Render Terminal QR Code & Stream to Database for UI Modal
client.on("qr", async (qr: string) => {
  console.log("\nScan this QR code with WhatsApp on your phone:\n");
  qrcode.generate(qr, { small: true });

  try {
    // Save QR code to database for UI polling
    await db
      .insert(systemStatus)
      .values({
        id: SESSION_ID,
        qrCode: qr,
        isConnected: false,
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          qrCode: qr,
          isConnected: false,
          updatedAt: new Date(),
        },
      });
    console.log("[QR] Synced QR code to database for screen modal.");
  } catch (err) {
    console.error("Error updating QR code in database:", err);
  }
});

// Step 2: Session Connected & Ready
client.on("ready", async () => {
  console.log("WhatsApp Web session active and ready!");

  try {
    // Update system_status table: set isConnected = true and clear QR code
    await db
      .insert(systemStatus)
      .values({
        id: SESSION_ID,
        qrCode: null,
        isConnected: true,
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          qrCode: null,
          isConnected: true,
          updatedAt: new Date(),
        },
      });
    console.log("[SESSION] Connected status synced to database.");
  } catch (err) {
    console.error("Error updating connection status in database:", err);
  }

  startOutboxPolling();
});

// Step 3: Live Inbound Interceptor (Strict Lead Whitelist Filter)
client.on("message", async (msg: Message) => {
  // 1. Ignore outbound messages, group messages (@g.us), and status updates
  if (
    msg.fromMe ||
    msg.from.includes("@g.us") ||
    msg.from === "status@broadcast"
  ) {
    return;
  }

  // 2. Extract clean digits (e.g. 254799843277@c.us -> 254799843277)
  const rawPhone: string = msg.from.replace(/\D/g, "");
  const textContent: string = msg.body;

  if (!rawPhone || !textContent) return;

  try {
    // 3. Strict Whitelist Check: Query MySQL for matching lead
    const [matchingLead] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(or(eq(leads.phone, rawPhone), eq(leads.realPhoneNumber, rawPhone)))
      .limit(1);

    // 4. Drop non-lead messages immediately (personal chats, untracked contacts)
    if (!matchingLead) {
      return;
    }

    const leadId = matchingLead.id;

    // 5. Insert incoming reply into messages table
    await db.insert(messages).values({
      id: crypto.randomUUID(),
      leadId,
      senderType: "CLIENT",
      messageText: textContent,
      status: "DELIVERED",
      createdAt: new Date(),
    });

    console.log(
      `[INBOUND] Received reply from +${rawPhone} for Lead #${leadId}`,
    );
  } catch (err) {
    console.error("Error saving inbound message:", err);
  }
});

// Step 4: Outbound Outbox Queue (Polling MySQL for PENDING messages)
function startOutboxPolling(): void {
  setInterval(async () => {
    try {
      // Fetch up to 5 PENDING developer messages joined with lead record
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

        const chatId = `${targetPhone}@c.us`;

        // Send message via active WhatsApp session
        await client.sendMessage(chatId, msg.messageText);

        // Update message status to 'SENT' and lead status to 'CONTACTED'
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
    } catch (err) {
      console.error("Error processing outbox queue:", err);
    }
  }, 3000); // Polls every 3 seconds
}

client.initialize();
