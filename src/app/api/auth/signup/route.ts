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
    const password = (body.password || "").trim();
    const fullName = sanitizeInput(body.fullName || "").trim();
    const companyName = sanitizeInput(body.companyName || "").trim();
    const existingSearchCode = sanitizeInput(body.searchCode || "")
      .toUpperCase()
      .trim();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        {
          message:
            "Full name, company workspace name, email, and password are required.",
        },
        { status: 400 },
      );
    }

    // 1. Check if email already registered
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "An account with this email address already exists." },
        { status: 409 },
      );
    }

    // 2. Provision User
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      fullName,
      role: "CLIENT",
      isActive: true,
    } as any);

    // 3. Provision Client Workspace
    const clientId = crypto.randomUUID();
    await db.insert(clients).values({
      id: clientId,
      userId,
      companyName,
    } as any);

    // 4. Provision Initial Project or Connect Existing Search Code
    let assignedProjectId: string | null = null;

    if (existingSearchCode) {
      const existingProj = await db
        .select()
        .from(projects)
        .where(eq(projects.searchCode, existingSearchCode))
        .limit(1);

      if (existingProj.length > 0) {
        assignedProjectId = existingProj[0].id;
      }
    }

    if (!assignedProjectId) {
      assignedProjectId = crypto.randomUUID();
      const generatedCode = `MB-${Math.floor(1000 + Math.random() * 9000)}-LUX`;

      await db.insert(projects).values({
        id: assignedProjectId,
        clientId,
        name: `${companyName} Digital Architecture`,
        status: "IN_PROGRESS",
        searchCode: generatedCode,
      } as any);
    }

    // 5. Issue Redis Session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      userId,
      role: "CLIENT",
      email,
      projectId: assignedProjectId,
    });

    await redis.set(
      `session:${sessionToken}`,
      sessionData,
      "EX",
      60 * 60 * 24 * 7,
    );

    const res = NextResponse.json({
      success: true,
      role: "CLIENT",
      projectId: assignedProjectId,
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
