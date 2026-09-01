"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      await refresh();
      toast.success("Login successful");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.identifier,
          otp,
          purpose: "registration",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Verification failed");
        return;
      }
      toast.success("Verified successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email or mobile and password to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showOtp ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Mobile</Label>
              <Input
                id="identifier"
                placeholder="you@example.com or 98XXXXXXXX"
                value={form.identifier}
                onChange={(e) =>
                  setForm({ ...form, identifier: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP sent to {form.identifier}</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6 digit OTP"
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
