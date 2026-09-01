"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderRow {
  _id: string;
  orderNumber: string;
  winningBidAmount: number;
  balanceDue: number;
  balancePaid: number;
  status: string;
  createdAt: Date;
  winnerId?: { email?: string; mobile?: string } | null;
  auctionId?: { title?: string } | null;
}

interface OrdersResponse {
  orders: OrderRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusTabs = ["all"];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const searchParams = new URLSearchParams();
  if (status !== "all") searchParams.set("status", status);
  searchParams.set("page", String(page));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders?${searchParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json() as Promise<OrdersResponse>;
    },
  });

  const statusVariant = (s: string) =>
    s === "paid" || s === "delivered"
      ? "secondary"
      : s === "cancelled" || s === "failed"
      ? "destructive"
      : "outline";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          View all orders across the platform.
        </p>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v)}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading orders...</span>
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Failed to load orders.
            </p>
          ) : data?.orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Truck className="h-8 w-8" />
              <p className="text-sm">No orders found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Auction</TableHead>
                  <TableHead>Winning Bid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.winnerId?.email || "—"}</TableCell>
                    <TableCell>{order.auctionId?.title || "—"}</TableCell>
                    <TableCell>
                      {formatCurrency(order.winningBidAmount)}
                    </TableCell>
                    <TableCell>{formatCurrency(order.balanceDue)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant(order.status)}
                        className="capitalize"
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
            {data.pagination.total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
