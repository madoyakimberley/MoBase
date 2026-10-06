import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, clients, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { enforceRateLimit, redis } from "@/lib/redis";
import { sanitizeInput } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = await enforceRateLimit(`login:${ip}`, 10, 60);

    if (!limit.success) {
      return NextResponse.json(
        { message: "Too many login attempts. Try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const email = sanitizeInput(body.email || "").toLowerCase();
    const password = (body.password || "").trim();
    const searchCode = sanitizeInput(body.searchCode || "").toUpperCase();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      );
    }

    const matchedUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
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

    let projectId: string | null = null;

    if (searchCode) {
      const proj = await db
        .select()
        .from(projects)
        .where(eq(projects.searchCode, searchCode))
        .limit(1);

      if (proj.length > 0) projectId = proj[0].id;
    } else if (user.role === "CLIENT") {
      const clientRecord = await db
        .select()
        .from(clients)
        .where(eq(clients.userId, user.id))
        .limit(1);

      if (clientRecord.length > 0) {
        const proj = await db
          .select()
          .from(projects)
          .where(eq(projects.clientId, clientRecord[0].id))
          .limit(1);

        if (proj.length > 0) projectId = proj[0].id;
      }
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      userId: user.id,
      role: user.role,
      email: user.email,
      projectId,
    });

    // ioredis syntax: "EX" followed by time in seconds (7 days = 604800s)
    await redis.set(
      `session:${sessionToken}`,
      sessionData,
      "EX",
      60 * 60 * 24 * 7,
    );

    const res = NextResponse.json({
      success: true,
      role: user.role,
      projectId,
    });

    res.cookies.set("mobase_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Authentication failed." },
      { status: 500 },
    );
  }
}
