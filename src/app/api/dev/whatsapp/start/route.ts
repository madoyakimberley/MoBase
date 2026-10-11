import { NextResponse } from "next/server";
import { Client } from "whatsapp-web.js";
import { db } from "@/db";
import { systemStatus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { validateOrigin } from "@/lib/security";

export const maxDuration = 60; // Allows up to 60s execution time on Vercel

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

    // Check if session is already connected
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

    // Await QR code generation before completing HTTP response
    const qrResult = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            "Timeout waiting for Browserless QR code generation (45s).",
          ),
        );
      }, 45000);

      client.on("qr", async (qr) => {
        clearTimeout(timeout);
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
          resolve(qr);
        } catch (err) {
          reject(err);
        }
      });

      client.on("ready", async () => {
        clearTimeout(timeout);
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
          resolve("CONNECTED");
        } catch (err) {
          reject(err);
        }
      });

      client.initialize().catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    return NextResponse.json({
      success: true,
      message: "QR code generated successfully.",
      qrCode: qrResult !== "CONNECTED" ? qrResult : null,
      developerId: userId,
    });
  } catch (error: any) {
    console.error("[WHATSAPP WORKER ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to boot WhatsApp worker." },
      { status: 500 },
    );
  }
}
