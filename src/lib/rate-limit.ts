import { db } from "@/db";
import { searchLogs } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import crypto from "crypto";

const MAX_SEARCHES_PER_WINDOW = 5;
const WINDOW_MINUTES = 15;

export async function checkScrapeRateLimit(userId: string) {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const recentLogs = await db
    .select()
    .from(searchLogs)
    .where(
      and(
        eq(searchLogs.developerId, userId),
        gte(searchLogs.executedAt, windowStart),
      ),
    );

  if (recentLogs.length >= MAX_SEARCHES_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetMinutes: WINDOW_MINUTES,
    };
  }

  return {
    allowed: true,
    remaining: MAX_SEARCHES_PER_WINDOW - recentLogs.length - 1,
    resetMinutes: WINDOW_MINUTES,
  };
}

export async function logSearchExecution(userId: string, query: string) {
  await db.insert(searchLogs).values({
    id: crypto.randomUUID(),
    developerId: userId,
    query,
    executedAt: new Date(),
  });
}
