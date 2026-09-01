"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Gavel,
  Users,
  BadgeCheck,
  RotateCcw,
  Truck,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface StatsResponse {
  liveAuctions: number;
  totalUsers: number;
  pendingPaymentVerifications: number;
  pendingRefunds: number;
  activeOrders: number;
  totalRevenue: number;
  recentActivity: {
    _id: string;
    eventType: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: string;
    serverTimestamp: string;
    reason?: string;
  }[];
}

export default function AdminDashboardHome() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/audit?limit=10", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const audit = await res.json();
      const mock = {
        liveAuctions: 12,
        totalUsers: 348,
        pendingPaymentVerifications: 5,
        pendingRefunds: 3,
        activeOrders: 27,
        totalRevenue: 2458000,
        recentActivity: audit.logs ?? [],
      };
      return mock as StatsResponse;
    },
  });

  const stats = [
    {
      label: "Live Auctions",
      value: isLoading ? "..." : String(data?.liveAuctions ?? 0),
      icon: Gavel,
    },
    {
      label: "Total Users",
      value: isLoading ? "..." : String(data?.totalUsers ?? 0),
      icon: Users,
    },
    {
      label: "Pending Payment Verifications",
      value: isLoading ? "..." : String(data?.pendingPaymentVerifications ?? 0),
      icon: BadgeCheck,
    },
    {
      label: "Pending Refunds",
      value: isLoading ? "..." : String(data?.pendingRefunds ?? 0),
      icon: RotateCcw,
    },
    {
      label: "Active Orders",
      value: isLoading ? "..." : String(data?.activeOrders ?? 0),
      icon: Truck,
    },
    {
      label: "Total Revenue",
      value: isLoading
        ? "..."
        : formatCurrency(data?.totalRevenue ?? 0),
      icon: IndianRupee,
    },
  ];

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Failed to load dashboard metrics.
          </p>
        </div>
      </div>
    );
  }

  const activity = data?.recentActivity ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform activity and key metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
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
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading activity...</span>
            </div>
          ) : activity.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.map((log) => (
                <div
                  key={log._id}
                  className="flex items-start justify-between rounded-lg bg-muted/50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.eventType} · {log.actorRole}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{log.entityType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.serverTimestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
