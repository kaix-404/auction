"use client";

import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Auction {
  _id: string;
  title: string;
  status: string;
  currentBidAmount: number;
  endDate: string;
  emdAmount: number;
  bidIncrement: number;
}

interface AuctionResponse {
  auctions: Auction[];
  pagination: { total: number };
}

export default function MyAuctionsPage() {
  const { user } = useAuth();
  const [nowMs] = useState(() => Date.now());
  const userId = user?.id;

  const { data, isLoading, isError } = useQuery<AuctionResponse>({
    queryKey: ["my-auctions", userId],
    queryFn: async () => {
      const res = await fetch("/api/auctions?limit=100&status=live,ended", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch auctions");
      return res.json();
    },
    enabled: !!userId,
  });

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    live: "default",
    ended: "secondary",
    registration_open: "outline",
    completed: "secondary",
    cancelled: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Auctions</h1>
        <p className="text-muted-foreground">Auctions you&apos;ve participated in or could bid on.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Failed to load auctions. Please try again.
            </div>
          ) : data?.auctions.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No auctions to show yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auction Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Your Highest Bid</TableHead>
                  <TableHead>Time Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.auctions.map((auction) => (
                  <TableRow key={auction._id}>
                    <TableCell className="font-medium">{auction.title}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[auction.status] || "outline"}>
                        {auction.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(auction.currentBidAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                        <TableCell>
                      {new Date(auction.endDate).getTime() <= nowMs
                        ? "Ended"
                        : `${Math.floor((new Date(auction.endDate).getTime() - nowMs) / 3600000)}h ${Math.floor((new Date(auction.endDate).getTime() - nowMs) % 3600000 / 60000)}m`}
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
