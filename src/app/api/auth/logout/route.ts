import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("mobase_session")?.value;

    if (sessionToken) {
      // Invalidate Redis session
      await redis.del(`session:${sessionToken}`);
    }

    const res = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Evict Session Cookie
    res.cookies.set("mobase_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ message: "Logout failed." }, { status: 500 });
  }
}
