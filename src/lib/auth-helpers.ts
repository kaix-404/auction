import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth";

export interface AuthContext {
  userId: string;
  role: string;
  sessionId: string;
}

export function getCookieValue(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value;
}

export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  const token = getCookieValue(request, "auction_token");
  if (!token) return null;
  return verifyJwt(token);
}

export function requireAuth(): NextResponse | null {
  return null;
}
