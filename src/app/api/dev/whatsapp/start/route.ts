import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { validateOrigin } from "@/lib/security";

const LOCK_FILE = path.join(process.cwd(), ".whatsapp-worker.lock");

export async function POST(req: Request) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json(
        { error: "Forbidden cross-origin request" },
        { status: 403 },
      );
    }

    const session = await getSession();
    if (
      !session ||
      (session.role !== "DEVELOPER" && session.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    const userId = session.userId || session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid developer session" },
        { status: 401 },
      );
    }

    // Lock check: Prevents duplicate workers from spawning concurrently
    if (fs.existsSync(LOCK_FILE)) {
      return NextResponse.json({
        success: true,
        message: "WhatsApp worker is already active.",
      });
    }

    // Record single-instance lock file with developer session metadata
    fs.writeFileSync(
      LOCK_FILE,
      JSON.stringify({
        startedAt: new Date().toISOString(),
        startedBy: userId,
      }),
    );

    // Spawn worker as an unreferenced background child process
    const child = spawn(
      "npx",
      ["tsx", "--env-file=.env.local", "server/whatsapp-worker.ts"],
      {
        detached: true,
        stdio: "ignore",
        cwd: process.cwd(),
      },
    );

    child.unref();

    return NextResponse.json({
      success: true,
      message: "WhatsApp worker spawned successfully.",
      developerId: userId,
    });
  } catch (error: any) {
    if (fs.existsSync(LOCK_FILE)) {
      try {
        fs.unlinkSync(LOCK_FILE);
      } catch {}
    }
    return NextResponse.json(
      { error: error.message || "Failed to boot WhatsApp worker." },
      { status: 500 },
    );
  }
}
