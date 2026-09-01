"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, CreditCard } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentRow {
  _id: string;
  amount: number;
  utr: string;
  method: string;
  status: string;
  createdAt: Date;
  userId?: { email?: string; mobile?: string } | null;
  auctionId?: { title?: string } | null;
}

interface PaymentsResponse {
  submissions: PaymentRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusTabs = ["all", "submitted", "under_review", "verified", "rejected"];

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PaymentRow | null>(null);
  const [actionType, setActionType] = useState<"verify" | "reject" | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams();
  if (status !== "all") searchParams.set("status", status);
  searchParams.set("page", String(page));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-payments", status, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/payments?${searchParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load payments");
      return res.json() as Promise<PaymentsResponse>;
    },
  });

  const handleAction = async () => {
    if (!selected || !actionType) return;
    if (actionType === "reject" && !reason.trim()) {
      toast.error("A reason is required to reject");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/payments/${selected._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          reason: reason.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to process payment");
      }
      toast.success(
        `Payment ${actionType === "verify" ? "verified" : "rejected"} successfully`
      );
      setSelected(null);
      setActionType(null);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to process payment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Verify and manage payment submissions.
        </p>
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
              <span className="text-sm">Loading payments...</span>
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Failed to load payments.
            </p>
          ) : data?.submissions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <CreditCard className="h-8 w-8" />
              <p className="text-sm">No payments found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Auction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.submissions.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.userId?.email || "—"}</TableCell>
                    <TableCell>
                      {payment.auctionId?.title || "—"}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.utr}</TableCell>
                    <TableCell className="uppercase">
                      {payment.method?.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "verified"
                            ? "secondary"
                            : payment.status === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {payment.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {(payment.status === "submitted" ||
                        payment.status === "under_review") && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Verify"
                            onClick={() => {
                              setSelected(payment);
                              setActionType("verify");
                              setReason("");
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Reject"
                            onClick={() => {
                              setSelected(payment);
                              setActionType("reject");
                              setReason("");
                            }}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
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
            {data.pagination.total} payments
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

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setActionType(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionType === "verify"
                ? "Verify payment"
                : actionType === "reject"
                ? "Reject payment"
                : "Payment details"}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `${formatCurrency(selected.amount)} by ${
                    selected.userId?.email || "unknown user"
                  }`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason</Label>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection"
              />
            </div>
          )}
          {actionType === "verify" && (
            <p className="text-sm text-muted-foreground">
              Confirm this payment submission is verified. This will mark the
              participant eligible if all payments are complete.
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(null);
                setActionType(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
