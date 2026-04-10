import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

  if (!BACKEND) {
    return NextResponse.json({ detail: "NEXT_PUBLIC_BACKEND_URL is not set" }, { status: 500 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("Proxy failed to reach backend:", BACKEND, err);
    return NextResponse.json({ detail: "Cannot reach API server" }, { status: 502 });
  }

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json(data);

  if (data.access_token) {
    response.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }
  if (data.refresh_token) {
    response.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}