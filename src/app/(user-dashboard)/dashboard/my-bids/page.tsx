"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
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
import { Loader2 } from "lucide-react";

interface Bid {
  _id: string;
  auctionId: { _id: string; title?: string } | string;
  amount: number;
  timestamp: string;
  status?: string;
}

interface BidsResponse {
  bids: Bid[];
}

export default function MyBidsPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, isError } = useQuery<BidsResponse>({
    queryKey: ["my-bids", userId],
    queryFn: async () => {
      const res = await fetch(`/api/bids?userId=${userId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch bids");
      return res.json();
    },
    enabled: !!userId,
  });

  const bids = data?.bids || [];
  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getAuctionTitle = (auctionId: Bid["auctionId"]) => {
    if (typeof auctionId === "object" && auctionId?.title) return auctionId.title;
    return "Auction";
  };

  const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
    accepted: "default",
    rejected: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bids</h1>
        <p className="text-muted-foreground">A record of all your bids across auctions.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Failed to load bids. Please try again.
            </div>
          ) : sortedBids.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              You haven&apos;t placed any bids yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBids.map((bid) => (
                  <TableRow key={bid._id}>
                    <TableCell className="font-medium">{getAuctionTitle(bid.auctionId)}</TableCell>
                    <TableCell>{formatCurrency(bid.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(bid.timestamp)}</TableCell>
                    <TableCell>
                      {bid.status ? (
                        <Badge variant={statusVariant[bid.status] || "secondary"}>
                          {bid.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
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
