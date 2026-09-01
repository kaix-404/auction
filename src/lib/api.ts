import { NextResponse, type NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth";
import type { JwtPayload } from "@/lib/auth";

export function getAuthContext(request: NextRequest): Promise<JwtPayload | null> {
  const token = request.cookies.get("auction_token")?.value;
  if (!token) return Promise.resolve(null);
  return verifyJwt(token);
}

export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function getCookieValue(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value;
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}
