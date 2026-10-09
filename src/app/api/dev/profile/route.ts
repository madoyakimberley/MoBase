import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { developers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Query developer workspace record
    let [devProfile] = await db
      .select({
        id: developers.id,
        userId: developers.userId,
        workspaceSlug: developers.workspaceSlug,
        companyName: developers.companyName,
        phone: developers.phone,
      })
      .from(developers)
      .where(eq(developers.userId, session.userId))
      .limit(1);

    // Auto-create developer workspace record if it doesn't exist yet
    if (!devProfile) {
      const devId = randomUUID();
      const slug = `${session.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${session.userId.slice(0, 6)}`;

      await db.insert(developers).values({
        id: devId,
        userId: session.userId,
        workspaceSlug: slug,
        companyName: `${session.fullName}'s Agency`,
        phone: null,
      });

      devProfile = {
        id: devId,
        userId: session.userId,
        workspaceSlug: slug,
        companyName: `${session.fullName}'s Agency`,
        phone: null,
      };
    }

    return NextResponse.json(devProfile);
  } catch (error) {
    console.error("GET /api/dev/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
