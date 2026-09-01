"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  auctionId: { _id: string; title?: string } | string;
  winningBidAmount: number;
  balanceDue: number;
  emdAdjusted: number;
  balancePaid: number;
  status: string;
  shippingAddressSnapshot?: Record<string, unknown>;
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  payment_pending: "secondary",
  partial_payment: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
  refunded: "outline",
};

const getAuctionTitle = (auctionId: Order["auctionId"]) => {
  if (typeof auctionId === "object" && auctionId?.title) return auctionId.title;
  return "Auction";
};

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<OrdersResponse>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Orders from your winning auctions.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Failed to load orders. Please try again.
            </div>
          ) : data?.orders.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Auction Title</TableHead>
                  <TableHead>Winning Bid</TableHead>
                  <TableHead>Balance Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.orders.map((order) => (
                  <>
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                      <TableCell className="font-medium">{getAuctionTitle(order.auctionId)}</TableCell>
                      <TableCell>{formatCurrency(order.winningBidAmount)}</TableCell>
                      <TableCell>{formatCurrency(order.balanceDue)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[order.status] || "secondary"}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm" onClick={() => toggleExpand(order._id)}>
                          {expanded === order._id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expanded === order._id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <div className="grid grid-cols-2 gap-4 py-2 sm:grid-cols-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Order Number</p>
                              <p className="font-mono text-sm">{order.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">EMD Adjusted</p>
                              <p className="text-sm">{formatCurrency(order.emdAdjusted)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Balance Paid</p>
                              <p className="text-sm">{formatCurrency(order.balancePaid)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Balance Due</p>
                              <p className="text-sm">{formatCurrency(order.balanceDue)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <Badge variant={statusVariant[order.status] || "secondary"}>
                                {order.status.replace("_", " ")}
                              </Badge>
                            </div>
                            {order.shippingAddressSnapshot && (
                              <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">Shipping Address</p>
                                <p className="text-sm">
                                  {String(order.shippingAddressSnapshot.name || "")},{" "}
                                  {String(order.shippingAddressSnapshot.addressLine1 || "")},{" "}
                                  {String(order.shippingAddressSnapshot.city || "")},{" "}
                                  {String(order.shippingAddressSnapshot.state || "")}{" "}
                                  {String(order.shippingAddressSnapshot.pin || "")}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
