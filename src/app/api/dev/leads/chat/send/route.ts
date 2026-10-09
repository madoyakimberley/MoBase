import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { leads, messages, leadAssignments } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { validateOrigin, validateMessageText, logError } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  let currentLeadId = "";
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

    const rawText = await req.text();
    const body = rawText ? JSON.parse(rawText) : {};
    const { leadId, messageText } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
        { status: 400 },
      );
    }

    currentLeadId = leadId;

    // 1. Validate message text (1 to 1,000 trimmed characters)
    const validation = validateMessageText(messageText);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Verify lead exists in database
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

    // 3. Strict Lead Ownership Check (Return 404 for unauthorized access)
    if (session.role !== "SUPER_ADMIN") {
      const [assignment] = await db
        .select()
        .from(leadAssignments)
        .where(
          and(
            eq(leadAssignments.leadId, leadId),
            eq(leadAssignments.developerId, userId),
          ),
        )
        .limit(1);

      if (!assignment) {
        return NextResponse.json(
          { error: "Lead not found or access denied" },
          { status: 404 },
        );
      }
    }

    // 4. Opt-Out Check
    if ((existingLead.status as string) === "DO_NOT_CONTACT") {
      return NextResponse.json(
        { error: "This lead has opted out of communication." },
        { status: 400 },
      );
    }

    // 5. 1-Minute Duplicate Message Suppression
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const [recentDuplicate] = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.leadId, leadId),
          eq(messages.messageText, validation.cleanText),
          gte(messages.createdAt, oneMinuteAgo),
        ),
      )
      .limit(1);

    if (recentDuplicate) {
      return NextResponse.json(
        {
          error:
            "Duplicate message detected. Please wait a minute before re-sending.",
        },
        { status: 429 },
      );
    }

    const messageId = crypto.randomUUID();

    // 6. Queue message with status 'PENDING' for whatsapp-worker to pick up
    await db.insert(messages).values({
      id: messageId,
      leadId,
      senderId: userId,
      senderType: "DEVELOPER",
      messageText: validation.cleanText,
      status: "PENDING",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: {
          id: messageId,
          leadId,
          senderType: "DEVELOPER" as const,
          messageText: validation.cleanText,
          status: "PENDING",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logError(
      "POST /api/dev/leads/chat/send error",
      currentLeadId || "unknown",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
