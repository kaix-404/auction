"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Plus,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

interface ProductRow {
  _id: string;
  sku: string;
  title: string;
  brand?: string;
  model?: string;
  condition?: string;
  costPrice: number;
  isActive: boolean;
  images?: string[];
}

interface ProductsResponse {
  products: ProductRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const conditions = ["new", "like_new", "good", "fair", "poor"];

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    condition: "new",
    costPrice: "",
    marketPrice: "",
    description: "",
    warranty: "",
    images: "",
  });
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams();
  if (search) searchParams.set("search", search);
  searchParams.set("page", String(page));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-products", search, page],
    queryFn: async () => {
      const res = await fetch(`/api/products?${searchParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json() as Promise<ProductsResponse>;
    },
  });

  const setField = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.costPrice) {
      toast.error("Title and cost price are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          brand: form.brand.trim(),
          model: form.model.trim(),
          condition: form.condition,
          costPrice: Number(form.costPrice),
          marketPrice: form.marketPrice ? Number(form.marketPrice) : undefined,
          description: form.description.trim(),
          warranty: form.warranty.trim(),
          images: form.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to create product");
      }
      toast.success("Product created successfully");
      setOpen(false);
      setForm({
        title: "",
        brand: "",
        model: "",
        condition: "new",
        costPrice: "",
        marketPrice: "",
        description: "",
        warranty: "",
        images: "",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage the product inventory for auctions.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4" />
            Add Product
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
              <DialogDescription>
                Create a new product for the inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Product title"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Brand</Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value)}
                    placeholder="Brand"
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={form.model}
                    onChange={(e) => setField("model", e.target.value)}
                    placeholder="Model"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Condition</Label>
                  <select
                    value={form.condition}
                    onChange={(e) => setField("condition", e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Cost Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.costPrice}
                    onChange={(e) => setField("costPrice", e.target.value)}
                    placeholder="Cost price"
                  />
                </div>
              </div>
              <div>
                <Label>Market Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.marketPrice}
                  onChange={(e) => setField("marketPrice", e.target.value)}
                  placeholder="Market price"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Product description"
                />
              </div>
              <div>
                <Label>Warranty</Label>
                <Input
                  value={form.warranty}
                  onChange={(e) => setField("warranty", e.target.value)}
                  placeholder="e.g. 1 year"
                />
              </div>
              <div>
                <Label>Image URLs</Label>
                <Textarea
                  value={form.images}
                  onChange={(e) => setField("images", e.target.value)}
                  placeholder="Comma separated image URLs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          className="pl-8"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading products...</span>
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Failed to load products.
            </p>
          ) : data?.products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Package className="h-8 w-8" />
              <p className="text-sm">No products found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.brand || "—"}</TableCell>
                    <TableCell>{product.model || "—"}</TableCell>
                    <TableCell className="capitalize">
                      {product.condition || "—"}
                    </TableCell>
                    <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "secondary" : "outline"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
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
            {data.pagination.total} products
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
