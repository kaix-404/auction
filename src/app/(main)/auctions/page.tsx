"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageX,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuctionCard } from "@/components/auction/auction-card";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "scheduled", label: "Scheduled" },
  { value: "ended", label: "Ended" },
];

const SORT_OPTIONS = [
  { value: "ending_soon", label: "Ending soon" },
  { value: "ending_latest", label: "Ending latest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

interface Auction {
  _id: string;
  title: string;
  productId?: {
    images?: string[];
    brand?: string;
    model?: string;
    condition?: string;
  } | null;
  currentBidAmount: number;
  reservePrice: number;
  bidIncrement: number;
  status: string;
  endDate: string;
  isFeatured?: boolean;
}

interface ListResponse {
  auctions: Auction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function AuctionsPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("ending_soon");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  const queryKey = ["auctions", { status, search, sort, page, limit }];

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<ListResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", String(limit));
      const res = await fetch(`/api/auctions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch auctions");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const totalPages = data?.pagination.totalPages ?? 1;
  const currentPage = data?.pagination.page ?? page;

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Auctions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and bid on live auctions
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={status} onValueChange={(v) => {
            setStatus(String(v));
            setPage(1);
          }}>
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Select value={sort} onValueChange={(v) => {
            setSort(String(v));
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-52">
              <ArrowUpDown className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search auctions..."
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} className="h-8">
            <Search className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="mt-3 text-sm">Loading auctions...</p>
        </div>
      ) : isError ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
          <PackageX className="size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Failed to load auctions</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching the list.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      ) : data && data.auctions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
          <PackageX className="size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No auctions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </Card>
      ) : (
        <div className="relative">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data?.auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
          {isFetching && !isLoading && (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center bg-background/40 pt-4">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages} · {data?.pagination.total ?? 0} total
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            {pageNumbers.map((num, idx) =>
              num === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="px-2 text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={num}
                  variant={num === currentPage ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setPage(num)}
                >
                  {num}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
