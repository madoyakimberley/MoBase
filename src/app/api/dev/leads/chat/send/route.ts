import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { leads, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { leadId, messageText } = body;

    if (!leadId || !messageText) {
      return NextResponse.json(
        { error: "leadId and messageText are required" },
        { status: 400 },
      );
    }

    // 1. Verify lead exists in database
    const [existingLead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead not found in database" },
        { status: 404 },
      );
    }

    const messageId = crypto.randomUUID();

    // 2. Queue message with status 'PENDING' for whatsapp-worker to pick up
    await db.insert(messages).values({
      id: messageId,
      leadId,
      senderId: session.user.id,
      senderType: "DEVELOPER",
      messageText,
      status: "PENDING",
      createdAt: new Date(),
    });

    // 3. Update lead status to 'CONTACTED'
    await db
      .update(leads)
      .set({ status: "CONTACTED" })
      .where(eq(leads.id, leadId));

    return NextResponse.json(
      {
        success: true,
        message: {
          id: messageId,
          leadId,
          senderType: "DEVELOPER" as const,
          messageText,
          status: "PENDING",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/dev/leads/chat/send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
