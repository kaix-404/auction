"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Gavel,
  HandCoins,
  Wallet,
  Package,
  ArrowRight,
} from "lucide-react";

export default function UserDashboardHome() {
  const { user } = useAuth();

  const stats = [
    { label: "My Auctions", value: "—", icon: Gavel, href: "/dashboard/my-auctions" },
    { label: "My Bids", value: "—", icon: HandCoins, href: "/dashboard/my-bids" },
    { label: "EMD Balance", value: "—", icon: Wallet, href: "/dashboard/emd" },
    { label: "Orders", value: "—", icon: Package, href: "/dashboard/orders" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user?.profile?.firstName || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Manage your auctions, bids, payments and orders from here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/auctions"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-between"
              )}
            >
              Browse Live Auctions <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/kyc"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-between"
              )}
            >
              Complete KYC <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/addresses"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-between"
              )}
            >
              Manage Addresses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/bank-accounts"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-between"
              )}
            >
              Manage Bank Accounts <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.isEmailVerified ? "Verified" : "Pending"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="text-muted-foreground">Mobile</span>
              <span>{user?.isMobileVerified ? "Verified" : "Pending"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{user?.status || "-"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="text-muted-foreground">Role</span>
              <span className="capitalize">{user?.role?.replace("_", " ") || "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
