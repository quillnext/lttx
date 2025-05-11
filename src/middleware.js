import { NextResponse } from "next/server";

// ✅ Only protect /dashboard routes
export function middleware(request) {
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
  const auth = request.cookies.get("adminAuth")?.value;

  if (isProtected && auth !== "authenticated") {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  return NextResponse.next();
}

// ✅ Apply middleware only to these routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
