import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Use server-only env var (no NEXT_PUBLIC_ prefix) for backend URL.
  // Falls back to the public one if that's all that's set.
  const BACKEND =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "";

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { detail: "Cannot reach API server" },
      { status: 502 }
    );
  }

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const isSecure = process.env.NODE_ENV === "production";
  const response = NextResponse.json(data);

  // Backend returns tokens in the response body — set them as cookies
  // on THIS domain (the frontend domain) so Next.js middleware can see them.
  if (data.access_token) {
    response.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      maxAge: 60 * 60 * 24,       // 1 day
      path: "/",
    });
  }
  if (data.refresh_token) {
    response.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      maxAge: 60 * 60 * 24 * 7,   // 7 days
      path: "/",
    });
  }

  return response;
}