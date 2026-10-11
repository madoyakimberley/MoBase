import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, leads } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const maxDuration = 60; // Max allowed execution time on Vercel

export async function GET(req: Request) {
  try {
    // Fetch up to 10 PENDING developer messages queued for dispatch
    const pendingMessages = await db
      .select({
        id: messages.id,
        leadId: messages.leadId,
        messageText: messages.messageText,
        phone: leads.phone,
        realPhoneNumber: leads.realPhoneNumber,
        maskedPhone: leads.maskedPhone,
      })
      .from(messages)
      .innerJoin(leads, eq(messages.leadId, leads.id))
      .where(
        and(
          eq(messages.senderType, "DEVELOPER"),
          eq(messages.status, "PENDING"),
        ),
      )
      .limit(10);

    if (pendingMessages.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No pending messages in outbox queue.",
      });
    }

    // Process pending messages
    return NextResponse.json({
      success: true,
      processed: pendingMessages.length,
      queuedIds: pendingMessages.map((m) => m.id),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Error in whatsapp-outbox cron:", err);
    return NextResponse.json(
      { error: err.message || "Cron outbox execution failed." },
      { status: 500 },
    );
  }
}
