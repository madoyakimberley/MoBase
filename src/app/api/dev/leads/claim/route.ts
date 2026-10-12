import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, leadAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { validateOrigin } from "@/lib/security";
import { redis } from "@/lib/redis";
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
    const { leadId, leadName, city, niche } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 },
      );
    }

    // 1. Correct ioredis parameter ordering: key, value, "EX", seconds, "NX"
    const lockKey = `lock:claim:${session.userId}:${leadId}`;
    const acquired = await redis.set(lockKey, "LOCKED", "EX", 2, "NX");

    if (!acquired) {
      return NextResponse.json(
        { error: "Duplicate claim request blocked." },
        { status: 429 },
      );
    }

    // 2. Fetch target lead from database
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 3. Calculate strict 48-hour prototype deadline
    const prototypeDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // 4. Check for existing developer assignment
    const [existingAssignment] = await db
      .select()
      .from(leadAssignments)
      .where(
        and(
          eq(leadAssignments.leadId, leadId),
          eq(leadAssignments.developerId, session.userId),
        ),
      );

    const activeContext = {
      leadId,
      leadName: lead.name || leadName || "Target Business",
      city: lead.city || city || "",
      niche: lead.niche || niche || "",
      claimedAt: new Date().toISOString(),
      prototypeDeadline: prototypeDeadline.toISOString(),
      assignedTier: "TIER_ALPHA_01",
    };

    if (existingAssignment) {
      await redis.set(
        `session:active_job:${session.userId}`,
        JSON.stringify(activeContext),
        "EX",
        172800,
      );

      return NextResponse.json({
        success: true,
        leadId,
        status: lead.status,
        deadline: prototypeDeadline.toISOString(),
        activeContext,
      });
    }

    if (lead.status !== "UNCLAIMED") {
      return NextResponse.json(
        { error: "This lead has already been claimed by another developer." },
        { status: 409 },
      );
    }

    // 5. Save assignment record matching Drizzle schema
    await db.insert(leadAssignments).values({
      id: crypto.randomUUID(),
      leadId,
      developerId: session.userId,
      claimedAt: new Date(),
      prototypeDeadline,
      assignedTier: "TIER_ALPHA_01",
    });

    // 6. Update lead status in database
    await db
      .update(leads)
      .set({ status: "CLAIMED" })
      .where(and(eq(leads.id, leadId), eq(leads.status, "UNCLAIMED")));

    // 7. Store Active Job Context in Redis for Vesper Handshake
    await redis.set(
      `session:active_job:${session.userId}`,
      JSON.stringify(activeContext),
      "EX",
      172800,
    );

    return NextResponse.json({
      success: true,
      leadId,
      status: "CLAIMED",
      deadline: prototypeDeadline.toISOString(),
      activeContext,
    });
  } catch (err: any) {
    console.error("[ERROR] Claim lead route error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to claim lead" },
      { status: 500 },
    );
  }
}
