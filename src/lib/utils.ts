import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateOnly(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Ended";
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function generateId(prefix: string, length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return "****";
  return `${"*".repeat(accountNumber.length - 4)}${accountNumber.slice(-4)}`;
}

export function maskMobile(mobile: string): string {
  if (mobile.length < 6) return "******";
  return `${mobile.slice(0, 2)}****${mobile.slice(-2)}`;
}

export function calculateNextBidAmount(currentBid: number, increment: number): number {
  return currentBid + increment;
}

export function generateOtp(length = 6): string {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "text-green-600 bg-green-50 border-green-200",
    pending: "text-amber-600 bg-amber-50 border-amber-200",
    live: "text-red-600 bg-red-50 border-red-200",
    ended: "text-gray-600 bg-gray-50 border-gray-200",
    verified: "text-green-600 bg-green-50 border-green-200",
    rejected: "text-red-600 bg-red-50 border-red-200",
    withdrawn: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return map[status] || "text-gray-600 bg-gray-50 border-gray-200";
}
