// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("mobase_session")?.value;

  // 1. Allow public routes
  if (
    pathname.startsWith("/portal/login") ||
    pathname.startsWith("/portal/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/s/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // 2. Redirect to login if session cookie is missing
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/api/portal/:path*"],
};
