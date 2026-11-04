import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getMiddlewareSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing or shorter than 32 characters."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isAccountRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secretKey = getMiddlewareSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    // Guard admin routes
    if (isAdminRoute && payload.role !== "ADMIN") {
      return new NextResponse("Access Forbidden: Administrator privileges required.", {
        status: 403,
      });
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
