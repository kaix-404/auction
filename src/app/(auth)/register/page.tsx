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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.details
          ? Object.values(data.details).flat().join(", ")
          : data.error;
        toast.error(detail || "Registration failed");
        return;
      }
      toast.success("Registered! Enter the OTP sent to your email");
      setShowOtp(true);
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
          identifier: form.email,
          otp,
          purpose: "registration",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Verification failed");
        return;
      }
      toast.success("Account verified! Please login");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Account</CardTitle>
          <CardDescription>
            Enter the OTP sent to {form.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Join BidVerse to start bidding</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="98XXXXXXXX"
              maxLength={10}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
