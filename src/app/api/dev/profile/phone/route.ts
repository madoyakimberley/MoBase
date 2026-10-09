import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const phone = body?.phone?.trim();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    const [existingDev] = await db
      .select({ id: developers.id })
      .from(developers)
      .where(eq(developers.userId, session.userId))
      .limit(1);

    if (existingDev) {
      await db
        .update(developers)
        .set({ phone })
        .where(eq(developers.userId, session.userId));
    } else {
      const slug = `${session.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${session.userId.slice(0, 6)}`;
      await db.insert(developers).values({
        id: randomUUID(),
        userId: session.userId,
        workspaceSlug: slug,
        companyName: `${session.fullName}'s Agency`,
        phone,
      });
    }

    return NextResponse.json({ success: true, phone }, { status: 200 });
  } catch (error) {
    console.error("POST /api/dev/profile/phone error:", error);
    return NextResponse.json(
      { error: "Failed to save phone number" },
      { status: 500 },
    );
  }
}
