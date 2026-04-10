import { NextResponse } from "next/server";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ message: "logged out successfully" });

  response.cookies.set("access_token", "", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 0,
    path: "/",
  });

  return response;
}