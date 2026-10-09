import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis";
import { db } from "@/db";
import { users } from "@/db/schema";

export const SESSION_COOKIE = "mobase_session";

export type Role = "SUPER_ADMIN" | "DEVELOPER" | "CLIENT";

export interface Session {
  userId: string;
  role: Role;
  fullName: string;
  email: string;
  user: {
    id: string;
    role: Role;
    fullName: string;
    email: string;
  };
}

/**
 * Reads the session cookie, looks it up in Redis, then loads the user from
 * MySQL. The role always comes from the database, so changing a role or
 * deactivating an account takes effect on the next request.
 * Returns null for anything wrong, so callers fail closed.
 */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const raw = await redis.get(`session:${token}`);
  if (!raw) return null;

  let data: { userId?: string } | null = null;
  try {
    data =
      typeof raw === "string" ? JSON.parse(raw) : (raw as { userId?: string });
  } catch {
    return null;
  }
  if (!data?.userId) return null;

  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, data.userId))
    .limit(1);

  if (!user || !user.isActive) return null;

  const role = user.role as Role;

  return {
    userId: user.id,
    role,
    fullName: user.fullName,
    email: user.email,
    user: {
      id: user.id,
      role,
      fullName: user.fullName,
      email: user.email,
    },
  };
}

export function hasRole(session: Session | null, ...roles: Role[]) {
  return !!session && roles.includes(session.role);
}
