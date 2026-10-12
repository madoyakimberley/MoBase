import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemStatus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { validateOrigin } from "@/lib/security";

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

    // Read real-time session state updated by Render background worker
    const [existing] = await db
      .select({
        isConnected: systemStatus.isConnected,
        qrCode: systemStatus.qrCode,
        updatedAt: systemStatus.updatedAt,
      })
      .from(systemStatus)
      .where(eq(systemStatus.id, SESSION_ID))
      .limit(1);

    return NextResponse.json({
      success: true,
      isConnected: Boolean(existing?.isConnected),
      qrCode: existing?.qrCode || null,
      message: existing?.isConnected
        ? "WhatsApp session is connected and active."
        : existing?.qrCode
          ? "Awaiting QR scan from background worker."
          : "Worker is initializing WhatsApp engine...",
    });
  } catch (error: any) {
    console.error("[WHATSAPP START API ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch WhatsApp worker state." },
      { status: 500 },
    );
  }
}
