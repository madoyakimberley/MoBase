import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, developers, clients, projects } from "@/db/schema";
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

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: "Full name, email, and password are required." },
        { status: 400 },
      );
    }

    // 1. Determine role: strictly SUPER_ADMIN if email matches .env.local, otherwise DEVELOPER
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
    const role =
      superAdminEmail && email === superAdminEmail
        ? "SUPER_ADMIN"
        : "DEVELOPER";

    // 2. Check if user email already exists
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

    // 3. Provision User Account
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      fullName,
      role,
      isActive: true,
    });

    // 4. Provision Workspace
    const developerId = crypto.randomUUID();
    const workspaceSlug =
      (companyName || fullName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `dev-${Date.now()}`;

    await db.insert(developers).values({
      id: developerId,
      userId,
      workspaceSlug,
      companyName: companyName || fullName,
    });

    // 5. Provision Initial Client Record (including contact name & brandName)
    const clientId = crypto.randomUUID();
    const clientSlug = (companyName || `${fullName}-client`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await db.insert(clients).values({
      id: clientId,
      developerId,
      userId,
      name: fullName,
      brandName: companyName || fullName,
      slug: clientSlug || `client-${Date.now()}`,
      businessType: "GENERAL",
      whatsappNumber: "0000000000",
    });

    // 6. Provision Initial Project or Connect Existing Search Code
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
      const generatedCode = `JOB-${Math.floor(10000 + Math.random() * 90000)}`;

      await db.insert(projects).values({
        id: assignedProjectId,
        searchCode: generatedCode,
        clientId,
        developerId,
        title: `${companyName || fullName} Digital Architecture`,
        status: "IN_PROGRESS",
        depositPaid: false,
        totalPriceKes: 20000,
      });
    }

    // 7. Issue Redis Session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      userId,
      developerId,
      role,
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
      role,
      developerId,
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
