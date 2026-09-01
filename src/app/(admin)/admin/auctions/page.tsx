"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Gavel } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AuctionRow {
  _id: string;
  title: string;
  reservePrice: number;
  currentBidAmount: number;
  participantCount: number;
  bidCount: number;
  status: string;
  startDate: Date;
  endDate: Date;
  product?: { title?: string; brand?: string; model?: string } | null;
}

interface AuctionsResponse {
  auctions: AuctionRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ProductOption {
  _id: string;
  title: string;
  brand?: string;
}

const statusTabs = [
  "all",
  "draft",
  "scheduled",
  "registration_open",
  "live",
  "ended",
];

export default function AdminAuctionsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    title: "",
    reservePrice: "",
    bidIncrement: "",
    participationFee: "",
    emdAmount: "",
    startDate: "",
    endDate: "",
    isFeatured: false,
    description: "",
    category: "",
  });
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams();
  if (status !== "all") searchParams.set("status", status);
  searchParams.set("page", String(page));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-auctions", status, page],
    queryFn: async () => {
      const res = await fetch(`/api/auctions?${searchParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load auctions");
      return res.json() as Promise<AuctionsResponse>;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-product-options"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=100");
      if (!res.ok) throw new Error("Failed to load products");
      return res.json() as Promise<{ products: ProductOption[] }>;
    },
    enabled: open,
  });

  const setField = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const required = [
      "productId",
      "title",
      "reservePrice",
      "bidIncrement",
      "participationFee",
      "emdAmount",
      "startDate",
      "endDate",
    ];
    for (const field of required) {
      if (!form[field as keyof typeof form]) {
        toast.error("Please fill all required fields");
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          title: form.title,
          reservePrice: Number(form.reservePrice),
          bidIncrement: Number(form.bidIncrement),
          participationFee: Number(form.participationFee),
          emdAmount: Number(form.emdAmount),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          isFeatured: form.isFeatured,
          description: form.description,
          category: form.category,
          status: "draft",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to create auction");
      }
      toast.success("Auction created successfully");
      setOpen(false);
      setForm({
        productId: "",
        title: "",
        reservePrice: "",
        bidIncrement: "",
        participationFee: "",
        emdAmount: "",
        startDate: "",
        endDate: "",
        isFeatured: false,
        description: "",
        category: "",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-auctions"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create auction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Auctions</h1>
          <p className="text-muted-foreground">
            Manage auctions across all statuses.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4" />
            Create Auction
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Auction</DialogTitle>
              <DialogDescription>
                Set up a new auction for a product.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Product *</Label>
                <select
                  value={form.productId}
                  onChange={(e) => setField("productId", e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                >
                  <option value="">Select product...</option>
                  {productsData?.products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                      {p.brand ? ` (${p.brand})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Auction title"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Reserve Price *</Label>
                  <Input
                    type="number"
                    value={form.reservePrice}
                    onChange={(e) => setField("reservePrice", e.target.value)}
                    placeholder="Reserve price"
                  />
                </div>
                <div>
                  <Label>Bid Increment *</Label>
                  <Input
                    type="number"
                    value={form.bidIncrement}
                    onChange={(e) => setField("bidIncrement", e.target.value)}
                    placeholder="Bid increment"
                  />
                </div>
                <div>
                  <Label>Participation Fee *</Label>
                  <Input
                    type="number"
                    value={form.participationFee}
                    onChange={(e) =>
                      setField("participationFee", e.target.value)
                    }
                    placeholder="Participation fee"
                  />
                </div>
                <div>
                  <Label>EMD Amount *</Label>
                  <Input
                    type="number"
                    value={form.emdAmount}
                    onChange={(e) => setField("emdAmount", e.target.value)}
                    placeholder="EMD amount"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setField("endDate", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  placeholder="Category"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Auction description"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setField("isFeatured", e.target.checked)}
                />
                Featured auction
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Auction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v)}>
        <TabsList className="flex-wrap">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading auctions...</span>
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Failed to load auctions.
            </p>
          ) : data?.auctions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Gavel className="h-8 w-8" />
              <p className="text-sm">No auctions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reserve</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.auctions.map((auction) => (
                  <TableRow key={auction._id}>
                    <TableCell>
                      <p className="font-medium">{auction.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {auction.product?.brand || ""}{" "}
                        {auction.product?.model || ""}
                      </p>
                    </TableCell>
                    <TableCell>{formatCurrency(auction.reservePrice)}</TableCell>
                    <TableCell>
                      {formatCurrency(auction.currentBidAmount || 0)}
                    </TableCell>
                    <TableCell>{auction.participantCount ?? 0}</TableCell>
                    <TableCell>{auction.bidCount ?? 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          auction.status === "live" ? "destructive" : "secondary"
                        }
                        className="capitalize"
                      >
                        {auction.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">
                        {formatDate(auction.startDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(auction.endDate)}
                      </p>
                    </TableCell>
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
            {data.pagination.total} auctions
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
