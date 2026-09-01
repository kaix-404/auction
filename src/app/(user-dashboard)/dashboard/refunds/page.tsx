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
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Refund {
  _id: string;
  refundId: string;
  auctionId: { _id: string; title?: string } | string;
  amount: number;
  status: string;
  utr?: string;
  createdAt: string;
}

interface RefundsResponse {
  refunds: Refund[];
}

const statusColor: Record<string, string> = {
  completed: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const getAuctionTitle = (auctionId: Refund["auctionId"]) => {
  if (typeof auctionId === "object" && auctionId?.title) return auctionId.title;
  return "Auction";
};

export default function RefundsPage() {
  const { data, isLoading, isError } = useQuery<RefundsResponse>({
    queryKey: ["refunds"],
    queryFn: async () => {
      const res = await fetch("/api/refunds", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch refunds");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">Track the status of your EMD refunds.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Failed to load refunds. Please try again.
            </div>
          ) : data?.refunds.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No refunds found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Auction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.refunds.map((refund) => (
                  <TableRow key={refund._id}>
                    <TableCell className="font-mono text-xs">{refund.refundId}</TableCell>
                    <TableCell className="font-medium">{getAuctionTitle(refund.auctionId)}</TableCell>
                    <TableCell>{formatCurrency(refund.amount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-4xl border px-2 py-0.5 text-xs font-medium ${statusColor[refund.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {refund.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{refund.utr || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(refund.createdAt)}</TableCell>
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
