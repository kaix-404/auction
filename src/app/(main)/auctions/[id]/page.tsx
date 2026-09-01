"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ImageIcon,
  Users,
  ListChecks,
  CalendarClock,
  CalendarDays,
  Wallet,
  ShieldCheck,
  Gavel,
  Loader2,
  LogIn,
  PackageX,
  CircleUserRound,
  BadgeCheck,
  XCircle,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CountdownTimer } from "@/components/auction/countdown";
import { useAuth } from "@/components/auth-provider";
import { useSocket } from "@/components/socket-provider";

interface Bid {
  _id: string;
  amount: number;
  timestamp: string;
  userId: { email: string; mobile: string };
}

interface AuctionDetail {
  _id: string;
  title: string;
  description?: string;
  reservePrice: number;
  bidIncrement: number;
  participationFee: number;
  emdAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  currentBidAmount: number;
  currentHighestBidder?: {
    email?: string;
    mobile?: string;
  } | null;
  participantCount: number;
  bidCount: number;
  productId?: {
    title?: string;
    brand?: string;
    model?: string;
    condition?: string;
    images?: string[];
    description?: string;
  } | null;
  winner?: {
    email?: string;
    mobile?: string;
  } | null;
}

interface DetailResponse {
  auction: AuctionDetail;
  recentBids: Bid[];
  participant: { eligibilityStatus: string } | null;
  me: { userId: string; role: string } | null;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "••••••";
  const masked =
    user.length > 2
      ? `${user.slice(0, 2)}${"•".repeat(Math.max(2, user.length - 2))}`
      : `${"•".repeat(user.length)}`;
  return `${masked}@${domain}`;
}

export default function AuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const socket = useSocket();

  const [activeImage, setActiveImage] = useState(0);
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [placingBid, setPlacingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["auction-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/auctions/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load auction");
      return res.json() as Promise<DetailResponse>;
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join-auction", id);
    const onUpdate = () => refetch();
    socket.on("bid-update", onUpdate);
    socket.on("auction-closed", onUpdate);
    return () => {
      socket.off("bid-update", onUpdate);
      socket.off("auction-closed", onUpdate);
      socket.emit("leave-auction", id);
    };
  }, [socket, id, refetch]);

  const auction = data?.auction;
  const recentBids = data?.recentBids ?? [];
  const isLive = auction?.status === "live";

  const images = useMemo(() => {
    if (!auction) return [];
    return auction.productId?.images?.length
      ? auction.productId.images
      : [];
  }, [auction]);

  const nextBid =
    (auction?.currentBidAmount ?? 0) + (auction?.bidIncrement ?? 0);

  const currentDefaultBid =
    auction && bidAmount === ""
      ? (auction.currentBidAmount ?? 0) + (auction.bidIncrement ?? 0)
      : Number(bidAmount);

  const handlePlaceBid = async () => {
    if (!auction || !user) return;
    const amount = currentDefaultBid;
    if (!amount || amount < nextBid) {
      setBidError(`Your bid must be at least ${formatCurrency(nextBid)}`);
      return;
    }
    setBidError(null);
    setPlacingBid(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: auction._id,
          amount,
          requestId: crypto.randomUUID(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to place bid");
      }
      toast.success("Bid placed successfully!");
      setBidAmount("");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-32 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-3 text-sm">Loading auction...</p>
      </div>
    );
  }

  if (isError || !auction) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-32 text-center">
        <PackageX className="size-10 text-muted-foreground" />
        <p className="mt-3 font-medium">Auction not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The auction you are looking for does not exist or was removed.
        </p>
        <Link href="/auctions">
          <Button variant="outline" className="mt-4">
            Back to auctions
          </Button>
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Current Bid",
      value: formatCurrency(auction.currentBidAmount || 0),
      icon: Gavel,
    },
    {
      label: "Reserve Price",
      value: formatCurrency(auction.reservePrice || 0),
      icon: Flag,
    },
    {
      label: "Bid Increment",
      value: formatCurrency(auction.bidIncrement || 0),
      icon: ListChecks,
    },
    {
      label: "Time Left",
      value: <CountdownTimer endDate={auction.endDate} />,
      icon: CalendarClock,
    },
  ];

  const infoCards = [
    { label: "Participation Fee", value: formatCurrency(auction.participationFee || 0), icon: Wallet },
    { label: "EMD Amount", value: formatCurrency(auction.emdAmount || 0), icon: ShieldCheck },
    { label: "Start Date", value: formatDate(auction.startDate), icon: CalendarDays },
    { label: "End Date", value: formatDate(auction.endDate), icon: CalendarClock },
    { label: "Participants", value: String(auction.participantCount ?? 0), icon: Users },
    { label: "Total Bids", value: String(auction.bidCount ?? 0), icon: ListChecks },
  ];

  const isLoggedIn = !!user;
  const participant = data?.participant ?? null;
  const isEligible =
    participant !== null && participant.eligibilityStatus === "eligible";

  const renderBidPanelContent = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold">Login to place a bid</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create an account or sign in to start bidding on this auction.
            </p>
          </div>
          <Link href="/login" className="w-full">
            <Button className="h-11 w-full">
              <LogIn className="size-4" />
              Login to Bid
            </Button>
          </Link>
        </div>
      );
    }

    if (!isLive) {
      return (
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">
              {auction.status === "ended" ? "Auction Ended" : "Auction Not Live"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {auction.status === "ended"
                ? "Bidding is closed for this auction."
                : "Bidding will open when the auction goes live."}
            </p>
          </div>
        </div>
      );
    }

    if (!isEligible) {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <CircleUserRound className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Not eligible to bid yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pay the participation fee and EMD, then get verified to start
                bidding on this auction.
              </p>
            </div>
          </div>
          <Link href="/dashboard" className="w-full">
            <Button className="h-11 w-full">Get verified</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Next bid amount</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(nextBid)}
          </p>
        </div>
        <Input
          type="number"
          value={currentDefaultBid}
          onChange={(e) => {
            setBidAmount(e.target.value === "" ? "" : Number(e.target.value));
            setBidError(null);
          }}
          placeholder={`Minimum ${formatCurrency(nextBid)}`}
          min={nextBid}
          className="h-11 text-base"
        />
        {bidError && <p className="text-xs text-destructive">{bidError}</p>}
        <Button
          onClick={handlePlaceBid}
          disabled={placingBid || currentDefaultBid < nextBid}
          className="h-11 w-full"
        >
          {placingBid ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Gavel className="size-4" />
          )}
          Place Bid
        </Button>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 pb-40 sm:px-6 lg:px-8 lg:pb-16">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant={isLive ? "destructive" : "secondary"}>
          {auction.status.toUpperCase()}
        </Badge>
        {auction.winner?.email ? (
          <Badge variant="outline" className="gap-1">
            <BadgeCheck className="size-3" />
            Won by {maskEmail(auction.winner.email)}
          </Badge>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[activeImage]}
                alt={auction.title}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
                <ImageIcon className="size-12" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 transition ${
                    idx === activeImage
                      ? "ring-2 ring-primary"
                      : "ring-foreground/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {auction.title}
            </h1>
            {(auction.productId?.brand ||
              auction.productId?.model ||
              auction.productId?.condition) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {auction.productId?.brand && (
                  <Badge variant="secondary">{auction.productId.brand}</Badge>
                )}
                {auction.productId?.model && (
                  <Badge variant="secondary">{auction.productId.model}</Badge>
                )}
                {auction.productId?.condition && (
                  <Badge variant="outline">
                    {auction.productId.condition}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} size="sm">
                <CardContent className="flex flex-col gap-1.5">
                  <stat.icon className="size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-bold sm:text-base">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {auction.description ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold">Description</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {auction.description}
              </p>
            </div>
          ) : null}

          <Separator />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {infoCards.map((card) => (
              <div key={card.label} className="flex items-start gap-3">
                <card.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-sm font-medium">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-4 text-primary" />
              Recent Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBids.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No bids yet. Be the first to place a bid!
              </p>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-2 pr-3">
                  {recentBids.map((bid) => (
                    <div
                      key={bid._id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(bid.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bid.userId?.email
                            ? maskEmail(bid.userId.email)
                            : bid.userId?.mobile
                            ? `+91 ${bid.userId.mobile}`
                            : "Anonymous"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(bid.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="size-4 text-primary" />
              Place a Bid
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoggedIn && isLive && isEligible && (
              <div className="mb-4 rounded-lg bg-muted px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current bid</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(auction.currentBidAmount || 0)}
                    </p>
                  </div>
                  <Badge variant={isLive ? "destructive" : "secondary"}>
                    LIVE
                  </Badge>
                </div>
                {auction.currentHighestBidder?.email && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Highest bidder:{" "}
                    {maskEmail(auction.currentHighestBidder.email)}
                  </p>
                )}
              </div>
            )}
            {renderBidPanelContent()}
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current bid</p>
              <p className="font-bold">
                {formatCurrency(auction.currentBidAmount || 0)}
              </p>
            </div>
            {isLive && (
              <Badge variant={isLive ? "destructive" : "secondary"}>LIVE</Badge>
            )}
          </div>
          {renderBidPanelContent()}
        </div>
      </div>

      {!isLive && (
        <div className="mt-6 rounded-lg bg-muted/50 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CountdownTimer endDate={auction.endDate} />
            <span className="text-muted-foreground">until auction ends</span>
          </div>
        </div>
      )}
    </div>
  );
}
