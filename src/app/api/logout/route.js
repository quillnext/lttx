// app/api/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/admin-login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  response.cookies.set("adminAuth", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return response;
}
