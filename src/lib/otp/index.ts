import { Redis } from "ioredis";
import { generateOtp } from "@/lib/utils";

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis("redis://localhost:6379");

const OTP_PREFIX = "otp:";
const OTP_EXPIRY = Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60;
const OTP_RATE_LIMIT_PREFIX = "otp:rate:";
const OTP_RATE_LIMIT = 5;

export async function createOtp(identifier: string): Promise<string> {
  const otp = generateOtp();

  const attempts = await redis.get(`${OTP_RATE_LIMIT_PREFIX}${identifier}`);
  if (attempts && Number(attempts) >= OTP_RATE_LIMIT) {
    throw new Error("Too many OTP requests. Please try again later.");
  }

  await redis.set(`${OTP_PREFIX}${identifier}`, otp, "EX", OTP_EXPIRY);
  await redis.incr(`${OTP_RATE_LIMIT_PREFIX}${identifier}`);
  await redis.expire(`${OTP_RATE_LIMIT_PREFIX}${identifier}`, 24 * 3600);

  return otp;
}

export async function verifyOtp(identifier: string, otp: string): Promise<boolean> {
  const stored = await redis.get(`${OTP_PREFIX}${identifier}`);
  if (!stored) return false;
  if (stored !== otp) return false;
  await redis.del(`${OTP_PREFIX}${identifier}`);
  return true;
}

export async function removeOtp(identifier: string): Promise<void> {
  await redis.del(`${OTP_PREFIX}${identifier}`);
}
