import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST() {
  try {
    // Spawns the whatsapp-worker in a background process if triggered
    exec("npx tsx --env-file=.env.local server/whatsapp-worker.ts", (error) => {
      if (error) {
        console.error("Worker boot error:", error);
      }
    });

    return NextResponse.json({
      success: true,
      message: "WhatsApp worker boot signal sent successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to boot WhatsApp worker." },
      { status: 500 },
    );
  }
}
