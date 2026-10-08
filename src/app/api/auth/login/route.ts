import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { enforceRateLimit, redis } from "@/lib/redis";
import { sanitizeInput } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    try {
      const limit = await enforceRateLimit(`login:${ip}`, 10, 60);
      if (!limit.success) {
        return NextResponse.json(
          { message: "Too many login attempts. Try again later." },
          { status: 429 },
        );
      }
    } catch (redisErr) {
      console.warn("Redis rate limit skipped:", redisErr);
    }

    const body = await req.json();
    const identifier = sanitizeInput(body.identifier || body.email || "")
      .toLowerCase()
      .trim();
    const password = (body.password || "").trim();
    const searchCode = sanitizeInput(body.searchCode || "").toUpperCase();
    const rememberWorkstation = Boolean(body.rememberWorkstation);

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Email/Username and password are required." },
        { status: 400 },
      );
    }

    // 1. Search database for user matching EITHER email OR username
    const matchedUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .limit(1);

    if (matchedUsers.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 },
      );
    }

    const user = matchedUsers[0];
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 },
      );
    }

    // 2. Strict Role Evaluation: SUPER_ADMIN if email matches .env.local
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
    const effectiveRole =
      superAdminEmail && user.email === superAdminEmail
        ? "SUPER_ADMIN"
        : user.role;

    if (user.role !== effectiveRole) {
      await db
        .update(users)
        .set({ role: effectiveRole })
        .where(eq(users.id, user.id));
    }

    // 3. Resolve Project Context
    let projectId: string | null = null;

    if (searchCode) {
      const proj = await db
        .select()
        .from(projects)
        .where(eq(projects.searchCode, searchCode))
        .limit(1);

      if (proj.length > 0) projectId = proj[0].id;
    }

    // 4. Determine Session Lifetime (30 Days if Remembered, 1 Day if Standard)
    const sessionTTL = rememberWorkstation
      ? 60 * 60 * 24 * 30
      : 60 * 60 * 24 * 1;

    // 5. Issue Session Token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      userId: user.id,
      role: effectiveRole,
      email: user.email,
      username: user.username,
      projectId,
    });

    try {
      await redis.set(`session:${sessionToken}`, sessionData, "EX", sessionTTL);
    } catch (redisErr) {
      console.error("Failed to write session to Redis:", redisErr);
      return NextResponse.json(
        { message: "Session store unavailable. Check Redis connection." },
        { status: 503 },
      );
    }

    const res = NextResponse.json({
      success: true,
      role: effectiveRole,
      projectId,
    });

    res.cookies.set("mobase_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTTL,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login Error Details:", error);
    return NextResponse.json(
      { message: "Authentication failed." },
      { status: 500 },
    );
  }
}
