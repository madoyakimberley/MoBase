import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, leadAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId } = await req.json();

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const [existingAssignment] = await db
      .select()
      .from(leadAssignments)
      .where(
        and(
          eq(leadAssignments.leadId, leadId),
          eq(leadAssignments.developerId, session.userId),
        ),
      );

    if (!existingAssignment) {
      await db.insert(leadAssignments).values({
        id: crypto.randomUUID(),
        leadId,
        developerId: session.userId,
        claimedAt: new Date(),
      });

      await db
        .update(leads)
        .set({ status: "CLAIMED" })
        .where(eq(leads.id, leadId));
    }

    return NextResponse.json({ success: true, leadId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
