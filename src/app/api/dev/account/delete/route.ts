import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  developers,
  leadAssignments,
  clients,
  searchLogs,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const developerId = searchParams.get("developerId");

    if (!userId && !developerId) {
      return NextResponse.json(
        { error: "userId or developerId is required for deletion." },
        { status: 400 },
      );
    }

    let targetUserId = userId;
    let targetDevId = developerId;

    // Resolve developerId if only userId is supplied
    if (targetUserId && !targetDevId) {
      const [dev] = await db
        .select({ id: developers.id })
        .from(developers)
        .where(eq(developers.userId, targetUserId))
        .limit(1);
      if (dev) targetDevId = dev.id;
    }

    // Cascading deletion across system tables
    if (targetDevId) {
      await db
        .delete(leadAssignments)
        .where(eq(leadAssignments.developerId, targetDevId));
      await db
        .delete(searchLogs)
        .where(eq(searchLogs.developerId, targetDevId));
      await db.delete(clients).where(eq(clients.developerId, targetDevId));
      await db.delete(developers).where(eq(developers.id, targetDevId));
    }

    if (targetUserId) {
      await db.delete(users).where(eq(users.id, targetUserId));
    }

    return NextResponse.json({
      success: true,
      message: `Developer account (${targetUserId || targetDevId}) permanently purged.`,
      deletedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Failed to delete developer account:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete account." },
      { status: 500 },
    );
  }
}
