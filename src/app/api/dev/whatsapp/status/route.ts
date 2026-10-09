import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { systemStatus } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_ID = "whatsapp-session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // 1. Fetch current WhatsApp session status from database
    const [statusRecord] = await db
      .select()
      .from(systemStatus)
      .where(eq(systemStatus.id, SESSION_ID))
      .limit(1);

    if (!statusRecord) {
      return NextResponse.json(
        { isConnected: false, qrCode: null },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        isConnected: Boolean(statusRecord.isConnected),
        qrCode: statusRecord.qrCode || null,
        updatedAt: statusRecord.updatedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/dev/whatsapp/status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
