import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, developers } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { enforceRateLimit, redis } from "@/lib/redis";
import { sanitizeInput } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = await enforceRateLimit(`signup:${ip}`, 5, 60);

    if (!limit.success) {
      return NextResponse.json(
        { message: "Too many signup requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const email = sanitizeInput(body.email || "")
      .toLowerCase()
      .trim();
    const username = sanitizeInput(body.username || "")
      .toLowerCase()
      .trim();
    const password = (body.password || "").trim();
    const fullName = sanitizeInput(body.fullName || "").trim();

    if (!email || !username || !password || !fullName) {
      return NextResponse.json(
        { message: "Full name, username, email, and password are required." },
        { status: 400 },
      );
    }

    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      return NextResponse.json(
        {
          message:
            "Username must be 3-30 characters long and contain only letters, numbers, underscores, or dots.",
        },
        { status: 400 },
      );
    }

    // 1. Determine role: SUPER_ADMIN if email matches .env.local, otherwise DEVELOPER
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
    const role =
      superAdminEmail && email === superAdminEmail
        ? "SUPER_ADMIN"
        : "DEVELOPER";

    // 2. Check if email or username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existingUser.length > 0) {
      if (existingUser[0].email === email) {
        return NextResponse.json(
          { message: "An account with this email address already exists." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { message: "This username is already taken. Please choose another." },
        { status: 409 },
      );
    }

    // 3. Provision User Account
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      id: userId,
      email,
      username,
      passwordHash,
      fullName,
      role,
      isActive: true,
    });

    // 4. Provision Workspace
    const developerId = crypto.randomUUID();
    const workspaceSlug =
      username ||
      fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") ||
      `dev-${Date.now()}`;

    await db.insert(developers).values({
      id: developerId,
      userId,
      workspaceSlug,
      companyName: fullName,
    });

    // 5. Issue Session Token (No dummy client or project created)
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      userId,
      developerId,
      role,
      email,
      username,
      projectId: null,
    });

    await redis.set(
      `session:${sessionToken}`,
      sessionData,
      "EX",
      60 * 60 * 24 * 7,
    );

    const res = NextResponse.json({
      success: true,
      role,
      developerId,
      projectId: null,
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
    console.error("Signup Workspace Error:", error);
    return NextResponse.json(
      { message: "Failed to establish workspace." },
      { status: 500 },
    );
  }
}
