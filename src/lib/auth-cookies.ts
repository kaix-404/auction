import { NextResponse } from "next/server";

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
