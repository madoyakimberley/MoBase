import { NextResponse } from "next/server";
import { Client } from "whatsapp-web.js";
import { db } from "@/db";
import { systemStatus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { validateOrigin } from "@/lib/security";

export const maxDuration = 60; // Extend duration limit on Vercel

const SESSION_ID = "whatsapp-session";

export async function POST(req: Request) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json(
        { error: "Forbidden cross-origin request" },
        { status: 403 },
      );
    }

    const session = await getSession();
    if (
      !session ||
      (session.role !== "DEVELOPER" && session.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    const userId = session.userId || session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid developer session" },
        { status: 401 },
      );
    }

    const browserlessKey = process.env.BROWSERLESS_API_KEY;

    if (!browserlessKey) {
      return NextResponse.json(
        {
          error:
            "BROWSERLESS_API_KEY is missing in Vercel Environment Variables. Please set BROWSERLESS_API_KEY in Vercel Project Settings.",
        },
        { status: 400 },
      );
    }

    // Check database lock status instead of local disk file
    const [existing] = await db
      .select({
        isConnected: systemStatus.isConnected,
        qrCode: systemStatus.qrCode,
      })
      .from(systemStatus)
      .where(eq(systemStatus.id, SESSION_ID))
      .limit(1);

    if (existing?.isConnected) {
      return NextResponse.json({
        success: true,
        message: "WhatsApp worker is already active and connected.",
        developerId: userId,
      });
    }

    // Connect Puppeteer directly to Browserless Cloud WebSocket
    const client = new Client({
      puppeteer: {
        browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessKey}`,
      },
    });

    client.on("qr", async (qr) => {
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
      } catch (err) {
        console.error("Failed to write QR code to database:", err);
      }
    });

    client.on("ready", async () => {
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
      } catch (err) {
        console.error("Failed to write connected state to database:", err);
      }
    });

    // Fire initialization asynchronously without stalling HTTP response
    client.initialize().catch((err) => {
      console.error("Failed to initialize remote WhatsApp client:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Remote WhatsApp worker spawned via Browserless.io.",
      developerId: userId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to boot WhatsApp worker." },
      { status: 500 },
    );
  }
}
