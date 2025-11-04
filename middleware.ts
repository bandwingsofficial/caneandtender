import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  // ✅ Allow login pages always
  if (
    pathname === "/admin/login" ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next()
  }

  // ✅ Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  // ✅ Customer Routes
  if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
    if (!token || token.role !== "CUSTOMER") {
      // If admin tries to access customer paths
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
  ]
}
