import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name required"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or mobile required"),
  password: z.string().min(1, "Password required"),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(["registration", "login"]),
});

export const bidSchema = z.object({
  auctionId: z.string().min(1),
  amount: z.number().min(1),
  requestId: z.string().optional(),
});
