import { db } from "@/db";
import { searchLogs } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import crypto from "crypto";

const MAX_SEARCHES_PER_WINDOW = 5;
const WINDOW_MINUTES = 15;

export async function checkScrapeRateLimit(userId: string) {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  // Optimized database COUNT query instead of fetching entire row arrays into memory
  const [result] = await db
    .select({ total: count() })
    .from(searchLogs)
    .where(
      and(
        eq(searchLogs.developerId, userId),
        gte(searchLogs.executedAt, windowStart),
      ),
    );

  const searchCount = result?.total ?? 0;

  if (searchCount >= MAX_SEARCHES_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetMinutes: WINDOW_MINUTES,
    };
  }

  return {
    allowed: true,
    remaining: MAX_SEARCHES_PER_WINDOW - searchCount - 1,
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
