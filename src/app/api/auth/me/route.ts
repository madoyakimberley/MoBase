import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        fullName: session.fullName,
        email: session.email,
        role: session.role,
      },
    });
  } catch (err) {
    console.error("Session check failed:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
