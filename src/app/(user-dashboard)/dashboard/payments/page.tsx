"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

interface Payment {
  _id: string;
  transactionId?: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  utr?: string;
}

interface PaymentsResponse {
  payments: Payment[];
}

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    auctionId: "",
    type: "",
    utr: "",
    amount: "",
    paymentDate: "",
    method: "",
  });

  const { data, isLoading, isError } = useQuery<PaymentsResponse>({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    verified: "default",
    pending: "secondary",
    submitted: "secondary",
    failed: "destructive",
    refunded: "outline",
    rejected: "destructive",
  };

  const handleSubmit = async () => {
    if (!form.auctionId || !form.type || !form.utr || !form.amount || !form.paymentDate || !form.method) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: form.auctionId,
          type: form.type,
          utr: form.utr,
          amount: Number(form.amount),
          paymentDate: form.paymentDate,
          method: form.method,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit payment");
      }
      toast.success("Payment submitted successfully");
      setOpen(false);
      setForm({ auctionId: "", type: "", utr: "", amount: "", paymentDate: "", method: "" });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Your payment history and submissions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" /> Submit New Payment
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit New Payment</DialogTitle>
              <DialogDescription>Enter the payment details for verification.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="auctionId">Auction ID</Label>
                <Input
                  id="auctionId"
                  value={form.auctionId}
                  onChange={(e) => setForm({ ...form, auctionId: e.target.value })}
                  placeholder="Enter auction ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participation_fee">Participation Fee</SelectItem>
                    <SelectItem value="emd">EMD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="utr">UTR</Label>
                  <Input
                    id="utr"
                    value={form.utr}
                    onChange={(e) => setForm({ ...form, utr: e.target.value })}
                    placeholder="Transaction UTR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v || "" })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="imps">IMPS</SelectItem>
                      <SelectItem value="neft">NEFT</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Failed to load payments. Please try again.
            </div>
          ) : data?.payments.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No payments yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="capitalize">{payment.type.replace("_", " ")}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[payment.status] || "secondary"}>
                        {payment.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{payment.utr || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(payment.createdAt)}</TableCell>
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
