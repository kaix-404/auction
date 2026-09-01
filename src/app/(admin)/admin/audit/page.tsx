"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { formatDate } from "@/lib/utils";

interface AuditRow {
  _id: string;
  eventType: string;
  actorId: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  reason?: string;
  serverTimestamp: string;
  beforeValues?: Record<string, unknown>;
  afterValues?: Record<string, unknown>;
}

interface AuditResponse {
  logs: AuditRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function AdminAuditPage() {
  const [eventType, setEventType] = useState("");
  const [actorId, setActorId] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const searchParams = new URLSearchParams();
  if (eventType) searchParams.set("eventType", eventType);
  if (actorId) searchParams.set("actorId", actorId);
  if (action) searchParams.set("action", action);
  if (from) searchParams.set("from", new Date(from).toISOString());
  if (to) searchParams.set("to", new Date(to).toISOString());
  searchParams.set("page", String(page));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-audit", eventType, actorId, action, from, to, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/audit?${searchParams.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load audit logs");
      return res.json() as Promise<AuditResponse>;
    },
  });

  const toggleRow = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderJSON = (obj?: Record<string, unknown>) => {
    if (!obj || Object.keys(obj).length === 0) return "—";
    return (
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
        {JSON.stringify(obj, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          Track administrative actions across the platform.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Event Type
            </p>
            <Input
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. payment.verify"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Actor ID
            </p>
            <Input
              value={actorId}
              onChange={(e) => {
                setActorId(e.target.value);
                setPage(1);
              }}
              placeholder="Actor ID"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Action
            </p>
            <Input
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. verify_payment"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              From
            </p>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              To
            </p>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEventType("");
                setActorId("");
                setAction("");
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading audit logs...</span>
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Failed to load audit logs.
            </p>
          ) : data?.logs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Shield className="h-8 w-8" />
              <p className="text-sm">No audit logs found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.logs.map((log) => (
                  <Fragment key={log._id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggleRow(log._id)}
                    >
                      <TableCell className="w-8">
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            expanded[log._id] && "rotate-180"
                          )}
                        />
                      </TableCell>
                      <TableCell>{formatDate(log.serverTimestamp)}</TableCell>
                      <TableCell>{log.eventType}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {log.actorRole || ""}
                          </p>
                          <p className="text-xs">{shortId(log.actorId)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.entityType}</Badge>{" "}
                        <span className="text-xs text-muted-foreground">
                          {shortId(log.entityId)}
                        </span>
                      </TableCell>
                      <TableCell>{log.reason || "—"}</TableCell>
                    </TableRow>
                    {expanded[log._id] && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="grid gap-3 py-2 sm:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs font-medium text-muted-foreground">
                                Before
                              </p>
                              {renderJSON(log.beforeValues)}
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-medium text-muted-foreground">
                                After
                              </p>
                              {renderJSON(log.afterValues)}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
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
            {data.pagination.total} logs
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

function shortId(id?: string): string {
  if (!id) return "—";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}
