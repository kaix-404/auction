"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  CheckCheck,
  Send,
  XCircle,
  Ban,
  RotateCcw,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RefundRow {
  _id: string;
  refundId: string;
  amount: number;
  utr?: string;
  status: string;
  createdAt: Date;
  userId?: { email?: string; mobile?: string } | null;
  auctionId?: { title?: string } | null;
  bankAccountId?: { accountHolderName?: string } | null;
}

interface RefundsResponse {
  refunds: RefundRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusTabs = [
  "all",
  "pending_review",
  "approved",
  "processing",
  "paid",
  "failed",
];

export default function AdminRefundsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RefundRow | null>(null);
  const [actionType, setActionType] = useState<
    "approve" | "process" | "fail" | "cancel" | null
  >(null);
  const [utr, setUtr] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams();
  if (status !== "all") searchParams.set("status", status);
  searchParams.set("page", String(page));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-refunds", status, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/refunds?${searchParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load refunds");
      return res.json() as Promise<RefundsResponse>;
    },
  });

  const openAction = (
    refund: RefundRow,
    type: "approve" | "process" | "fail" | "cancel"
  ) => {
    setSelected(refund);
    setActionType(type);
    setUtr("");
    setReason("");
  };

  const handleAction = async () => {
    if (!selected || !actionType) return;
    if (actionType === "process" && !utr.trim()) {
      toast.error("UTR is required to process the refund");
      return;
    }
    if (actionType === "fail" && !reason.trim()) {
      toast.error("A reason is required to mark failed");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/refunds/${selected._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          utr: utr.trim() || undefined,
          reason: reason.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to process refund");
      }
      toast.success(`Refund ${actionType} completed`);
      setSelected(null);
      setActionType(null);
      setUtr("");
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  const actionLabel: Record<string, string> = {
    approve: "Approve",
    process: "Process",
    fail: "Mark Failed",
    cancel: "Cancel",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">
          Manage EMD refund processing.
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
              <span className="text-sm">Loading refunds...</span>
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Failed to load refunds.
            </p>
          ) : data?.refunds.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <RotateCcw className="h-8 w-8" />
              <p className="text-sm">No refunds found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Auction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.refunds.map((refund) => (
                  <TableRow key={refund._id}>
                    <TableCell>{refund.refundId}</TableCell>
                    <TableCell>{refund.userId?.email || "—"}</TableCell>
                    <TableCell>{refund.auctionId?.title || "—"}</TableCell>
                    <TableCell>{formatCurrency(refund.amount)}</TableCell>
                    <TableCell>
                      {refund.bankAccountId?.accountHolderName || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          refund.status === "paid"
                            ? "secondary"
                            : refund.status === "failed"
                            ? "destructive"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {refund.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{refund.utr || "—"}</TableCell>
                    <TableCell>{formatDate(refund.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {refund.status === "pending_review" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Approve"
                            onClick={() => openAction(refund, "approve")}
                          >
                            <CheckCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {refund.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Process"
                            onClick={() => openAction(refund, "process")}
                          >
                            <Send className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {refund.status === "processing" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Process"
                            onClick={() => openAction(refund, "process")}
                          >
                            <Send className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {(refund.status === "pending_review" ||
                          refund.status === "approved" ||
                          refund.status === "processing") && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Mark Failed"
                              onClick={() => openAction(refund, "fail")}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Cancel"
                              onClick={() => openAction(refund, "cancel")}
                            >
                              <Ban className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </>
                        )}
                      </div>
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
            {data.pagination.total} refunds
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
            setUtr("");
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionLabel[actionType || ""]}</DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.refundId} · ${formatCurrency(selected.amount)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {actionType === "process" && (
            <div className="space-y-2">
              <Label htmlFor="utr">UTR</Label>
              <Input
                id="utr"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Refund UTR number"
              />
            </div>
          )}
          {actionType === "fail" && (
            <div className="space-y-2">
              <Label htmlFor="fail-reason">Reason</Label>
              <Textarea
                id="fail-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for failure"
              />
            </div>
          )}
          {actionType === "approve" && (
            <p className="text-sm text-muted-foreground">
              Approve this refund. It will move to the approved state and wait
              for processing.
            </p>
          )}
          {actionType === "cancel" && (
            <p className="text-sm text-muted-foreground">
              Cancel this refund. This cannot be undone.
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(null);
                setActionType(null);
                setUtr("");
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionType === "fail" || actionType === "cancel"
                  ? "destructive"
                  : "default"
              }
              onClick={handleAction}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionLabel[actionType || ""] || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
