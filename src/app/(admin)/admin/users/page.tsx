"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Eye,
  Ban,
  ShieldOff,
  ShieldCheck,
  UserX,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

interface UserRow {
  _id: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  createdAt: Date;
}

interface UsersResponse {
  users: UserRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusTabs = ["all", "active", "suspended", "blocked"];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [actionUser, setActionUser] = useState<UserRow | null>(null);
  const [actionType, setActionType] = useState<
    "suspend" | "block" | "reactivate" | null
  >(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams();
  if (status !== "all") searchParams.set("status", status);
  if (search) searchParams.set("search", search);
  searchParams.set("page", String(page));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", status, search, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?${searchParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load users");
      return res.json() as Promise<UsersResponse>;
    },
  });

  const handleAction = async () => {
    if (!actionUser || !actionType) return;
    if (
      (actionType === "suspend" || actionType === "block") &&
      !reason.trim()
    ) {
      toast.error("A reason is required");
      return;
    }
    setSubmitting(true);
    try {
      const nextStatus =
        actionType === "suspend"
          ? "suspended"
          : actionType === "block"
          ? "blocked"
          : "active";
      const res = await fetch(`/api/admin/users/${actionUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reason: reason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to update user");
      }
      toast.success(
        `User ${
          nextStatus === "active" ? "reactivated" : nextStatus
        } successfully`
      );
      setActionUser(null);
      setActionType(null);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const openAction = (
    user: UserRow,
    type: "suspend" | "block" | "reactivate"
  ) => {
    setActionUser(user);
    setActionType(type);
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and account statuses.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v)}>
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search email or mobile..."
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Failed to load users.
            </p>
          ) : data?.users.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobile || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active" ? "secondary" : "destructive"
                        }
                        className="capitalize"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.status === "active" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Suspend"
                              onClick={() => openAction(user, "suspend")}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Block"
                              onClick={() => openAction(user, "block")}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(user.status === "suspended" ||
                          user.status === "blocked") && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Reactivate"
                            onClick={() => openAction(user, "reactivate")}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
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
            {data.pagination.total} users
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
        open={!!actionUser}
        onOpenChange={(open) => {
          if (!open) {
            setActionUser(null);
            setActionType(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionType === "reactivate"
                ? "Reactivate user"
                : actionType === "suspend"
                ? "Suspend user"
                : actionType === "block"
                ? "Block user"
                : "User action"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "reactivate"
                ? `Reactivate ${actionUser?.email}?`
                : actionType
                ? `Set ${actionUser?.email} to ${actionType}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {actionType === "reactivate" ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldOff className="h-4 w-4" />
              This will set the account back to active.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for this action"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionUser(null);
                setActionType(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "block" ? "destructive" : "default"}
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
