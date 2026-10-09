import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, leadAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { validateOrigin } from "@/lib/security";
import crypto from "crypto";

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

    const rawText = await req.text();
    const body = rawText ? JSON.parse(rawText) : {};
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 },
      );
    }

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const [existingAssignment] = await db
      .select()
      .from(leadAssignments)
      .where(
        and(
          eq(leadAssignments.leadId, leadId),
          eq(leadAssignments.developerId, session.userId),
        ),
      );

    if (existingAssignment) {
      return NextResponse.json({
        success: true,
        leadId,
        status: lead.status,
      });
    }

    if (lead.status !== "UNCLAIMED") {
      return NextResponse.json(
        { error: "This lead has already been claimed by another developer." },
        { status: 409 },
      );
    }

    await db.insert(leadAssignments).values({
      id: crypto.randomUUID(),
      leadId,
      developerId: session.userId,
      claimedAt: new Date(),
    });

    await db
      .update(leads)
      .set({ status: "CLAIMED" })
      .where(and(eq(leads.id, leadId), eq(leads.status, "UNCLAIMED")));

    return NextResponse.json({
      success: true,
      leadId,
      status: "CLAIMED",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to claim lead" },
      { status: 500 },
    );
  }
}
