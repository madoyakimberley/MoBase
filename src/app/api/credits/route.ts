import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: true, credits: 1000 });
    }

    return NextResponse.json({
      success: true,
      credits: 1000,
      userId: session.userId,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch credit balance",
        credits: 1000,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const body = raw ? JSON.parse(raw) : {};
    const amount = body.amount || 10;

    return NextResponse.json({
      success: true,
      deducted: amount,
      credits: Math.max(0, 1000 - amount),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to deduct credits" },
      { status: 500 },
    );
  }
}
