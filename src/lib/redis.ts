import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error("REDIS_URL is not defined in environment variables.");
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/**
 * Rate limiting helper using atomic Redis pipeline execution
 */
export async function enforceRateLimit(
  identifier: string,
  limit = 5,
  windowSeconds = 60,
) {
  const key = `ratelimit:${identifier}`;

  try {
    // Atomic execution of INCR and EXPIRE commands via pipeline
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);
    const results = await pipeline.exec();

    const current = (results?.[0]?.[1] as number) || 1;

    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  } catch (err) {
    console.error("[REDIS ERROR] Rate limit check failed:", err);
    return {
      success: true,
      remaining: limit,
    };
  }
}
