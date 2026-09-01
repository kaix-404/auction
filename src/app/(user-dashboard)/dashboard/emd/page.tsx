"use client";

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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, Lock, RefreshCcw } from "lucide-react";

interface EmdEntry {
  _id: string;
  auctionId: { _id: string; title?: string } | string;
  amount: number;
  type: "locked" | "released" | "refunded" | "adjusted" | "forfeited";
  createdAt: string;
}

interface PaymentsResponse {
  payments: EmdEntry[];
}

const typeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  locked: "default",
  released: "secondary",
  refunded: "outline",
  adjusted: "secondary",
  forfeited: "destructive",
};

const getAuctionTitle = (auctionId: EmdEntry["auctionId"]) => {
  if (typeof auctionId === "object" && auctionId?.title) return auctionId.title;
  return "Auction";
};

export default function EmdPage() {
  const { data, isLoading, isError } = useQuery<PaymentsResponse>({
    queryKey: ["emd"],
    queryFn: async () => {
      const res = await fetch("/api/payments?type=emd", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch EMD data");
      return res.json();
    },
  });

  const entries = data?.payments;

  const totalLocked = (entries || [])
    .filter((e) => e.type === "locked")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalRefunded = (entries || [])
    .filter((e) => e.type === "refunded")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">EMD Ledger</h1>
        <p className="text-muted-foreground">Track your Earnest Money Deposit across auctions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalLocked)}</p>
              <p className="text-sm text-muted-foreground">Total Locked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-500/10">
              <RefreshCcw className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalRefunded)}</p>
              <p className="text-sm text-muted-foreground">Total Refunded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Failed to load EMD data. Please try again.
            </div>
          ) : entries?.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No EMD transactions yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auction Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries?.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell className="font-medium">{getAuctionTitle(entry.auctionId)}</TableCell>
                    <TableCell>{formatCurrency(entry.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={typeVariant[entry.type] || "secondary"}>
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(entry.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
