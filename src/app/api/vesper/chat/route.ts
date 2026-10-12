import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

interface SessionUser {
  id?: string;
  fullName?: string;
  username?: string;
  name?: string;
  email?: string;
}

function formatDevName(user?: SessionUser): string {
  if (user?.fullName && user.fullName.trim().length > 0) {
    const firstName = user.fullName.trim().split(" ")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  }
  if (user?.name && user.name.trim().length > 0) {
    const firstName = user.name.trim().split(" ")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  }
  if (user?.username && user.username.trim().length > 0) {
    const clean = user.username.replace(/[0-9_.-]/g, "");
    if (clean.length > 0) {
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
    return user.username;
  }
  if (user?.email) {
    const prefix = user.email.split("@")[0].replace(/[0-9_.-]/g, "");
    if (prefix.length > 0) {
      return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
    }
  }
  return "Developer";
}

export async function GET() {
  try {
    const session = await getSession();
    const user = session?.user as SessionUser | undefined;
    const devName = formatDevName(user);

    return NextResponse.json({
      success: true,
      user: {
        id: session?.userId || user?.id || "dev_local",
        name: devName,
        email: user?.email || "",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to resolve developer session",
        user: { name: "Developer" },
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as SessionUser | undefined;
    const devName = formatDevName(user);

    const body = await req.json();
    const { messages = [], activeLeadName = "Target Client" } = body;

    return NextResponse.json({
      success: true,
      devName,
      activeLeadName,
      receivedMessageCount: messages.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Vesper API processing error" },
      { status: 500 },
    );
  }
}
