"use client";

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
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
}

const typeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  payment_verified: "default",
  payment_rejected: "destructive",
  payment_submitted: "secondary",
  won: "default",
  lost: "secondary",
  outbid: "destructive",
  refund_completed: "default",
  refund_failed: "destructive",
  refund_initiated: "secondary",
  kyc_status: "secondary",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/users/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  const unreadCount = data?.notifications.filter((n) => !n.read).length || 0;

  const markAsRead = async (notification: Notification) => {
    if (notification.read) return;
    try {
      await fetch(`/api/users/notifications/${notification._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          {unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : "You're all caught up."}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Failed to load notifications. Please try again.
            </div>
          ) : data?.notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              No notifications yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Body</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.notifications.map((notification) => (
                  <TableRow
                    key={notification._id}
                    className={!notification.read ? "bg-primary/5" : ""}
                    onClick={() => markAsRead(notification)}
                  >
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {notification.body}
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeVariant[notification.type] || "secondary"}>
                        {notification.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </TableCell>
                    <TableCell>
                      {notification.read ? (
                        <Badge variant="outline">Read</Badge>
                      ) : (
                        <Badge>Unread</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification);
                          }}
                        >
                          Mark read
                        </Button>
                      )}
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
