import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload {
  userId: string;
  role: string;
  sessionId: string;
  email?: string;
  [key: string]: string | undefined;
}

export async function signToken(payload: {
  userId: string;
  role: string;
  sessionId: string;
  email?: string;
}): Promise<string> {
  return new SignJWT(payload as JwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      `${Number(process.env.JWT_EXPIRY_DAYS || 7)}d`
    )
    .sign(secretKey);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
