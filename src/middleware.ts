import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface JwtPayload {
  userId: string;
  role: string;
  sessionId: string;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("auction_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * Number(process.env.JWT_EXPIRY_DAYS || 7),
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set("auction_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

const ADMIN_PREFIXES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auction_token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!payload) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    const isAdmin = payload.role !== "user";
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
