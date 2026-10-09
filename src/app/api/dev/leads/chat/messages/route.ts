import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { messages, leads, leadAssignments } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
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
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 2. Strict Lead Ownership Check (Return 404 for unauthorized access)
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

    // 3. Fetch message history for the specified lead ordered by createdAt ascending
    const chatHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.leadId, leadId))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({ messages: chatHistory }, { status: 200 });
  } catch (error) {
    console.error("GET /api/dev/leads/chat/messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
