import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PLATFORM_ROOT = process.env.NEXT_PUBLIC_BLACKBIRD_PLATFORM_URL ?? "https://blackbirdzzzz.art";
const SESSION_URL = `${PLATFORM_ROOT.replace(/\/$/, "")}/v1/auth/session`;
const LOGIN_URL = `${PLATFORM_ROOT.replace(/\/$/, "")}/login`;
const AUTH_COOKIE_NAMES = ["__Secure-bb_session", "bb_session"];
const PUBLIC_PATH_PREFIXES = ["/_next", "/assets", "/api/health"];
const PUBLIC_PATHS = new Set(["/favicon.ico", "/robots.txt", "/sitemap.xml"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL(LOGIN_URL);
  loginUrl.searchParams.set("returnTo", request.nextUrl.href);
  return loginUrl;
}

function hasAuthCookie(request: NextRequest) {
  return AUTH_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

async function validateSession(request: NextRequest) {
  if (!hasAuthCookie(request)) {
    return false;
  }

  try {
    const response = await fetch(SESSION_URL, {
      method: "GET",
      headers: {
        accept: "application/json",
        cookie: request.headers.get("cookie") ?? ""
      },
      cache: "no-store"
    });
    return response.ok;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS" || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionValid = await validateSession(request);
  if (sessionValid === true) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const status = sessionValid === null ? 503 : 401;
    return NextResponse.json(
      {
        ok: false,
        error: sessionValid === null ? "Authentication service unavailable" : "Authentication required",
        loginUrl: buildLoginRedirect(request).toString()
      },
      { status }
    );
  }

  if (sessionValid === null) {
    return new NextResponse("Authentication service unavailable", { status: 503 });
  }

  return NextResponse.redirect(buildLoginRedirect(request));
}

export const config = {
  matcher: ["/:path*"]
};
