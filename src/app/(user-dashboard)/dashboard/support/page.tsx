"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Plus, LifeBuoy } from "lucide-react";

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface TicketsResponse {
  tickets: Ticket[];
}

const statusColor: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-teal-100 text-teal-800",
  closed: "bg-muted text-muted-foreground",
};

const emptyForm = {
  subject: "",
  category: "",
  message: "",
};

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError } = useQuery<TicketsResponse>({
    queryKey: ["support"],
    queryFn: async () => {
      const res = await fetch("/api/support", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
  });

  const tickets = data?.tickets || [];

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, category: form.category || "general" }),
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      toast.success("Support ticket created successfully");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["support"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">Get help with your account, payments, and auctions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button onClick={openNew} />}>
            <Plus className="size-4" /> New Ticket
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Describe your issue and our team will get back to you.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief summary of the issue"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="auction">Auction</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue in detail"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Submit Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Failed to load support tickets. Please try again.
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
          <LifeBuoy className="mb-2 h-8 w-8" />
          No support tickets yet. Create one to get help.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tickets.map((ticket) => (
            <Card key={ticket._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{ticket.subject}</span>
                  <Badge
                    className={statusColor[ticket.status] || "bg-muted text-muted-foreground"}
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {ticket.ticketNumber} • {ticket.category} • {formatDate(ticket.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-muted-foreground">{ticket.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
