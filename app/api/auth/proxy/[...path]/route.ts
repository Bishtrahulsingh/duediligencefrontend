import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

async function proxy(req: NextRequest, params: { path: string[] }) {
  if (!BACKEND) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_BACKEND_URL is not set" },
      { status: 500 }
    );
  }

  const path = params.path.join("/");
  const search = req.nextUrl.search ?? "";
  const url = `${BACKEND}/${path}${search}`;

  const accessToken = req.cookies.get("access_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
    headers["Cookie"] = `access_token=${accessToken}`;
  }

  let backendRes: Response;
  try {
    const body =
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined;

    backendRes = await fetch(url, {
      method: req.method,
      headers,
      body,
    });
  } catch (err) {
    console.error("Proxy failed to reach backend:", url, err);
    return NextResponse.json(
      { detail: "Cannot reach API server" },
      { status: 502 }
    );
  }

  const contentType = backendRes.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  }

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: { "Content-Type": contentType || "text/plain" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}