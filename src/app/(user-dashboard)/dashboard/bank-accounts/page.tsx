"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "sonner";
import { Loader2, Plus, Landmark } from "lucide-react";

interface BankAccount {
  _id: string;
  holderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType: "savings" | "current";
  isDefault: boolean;
  status: "pending_review" | "approved" | "rejected";
}

interface BankAccountsResponse {
  accounts: BankAccount[];
}

const emptyForm = {
  holderName: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  accountType: "",
  isDefault: false,
};

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default",
  pending_review: "secondary",
  rejected: "destructive",
};

export default function BankAccountsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError } = useQuery<BankAccountsResponse>({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/users/bank-accounts", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch bank accounts");
      return res.json();
    },
  });

  const accounts = data?.accounts || [];

  const openAdd = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.holderName || !form.bankName || !form.accountNumber || !form.ifsc || !form.accountType) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/users/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add bank account");
      toast.success("Bank account added successfully");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add bank account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts for refunds and payments.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button onClick={openAdd} />}>
            <Plus className="size-4" /> Add Bank Account
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
              <DialogDescription>Add a bank account for payouts and refunds.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="holderName">Account Holder Name</Label>
                <Input
                  id="holderName"
                  value={form.holderName}
                  onChange={(e) => setForm({ ...form, holderName: e.target.value })}
                  placeholder="Name on account"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC Code</Label>
                <Input
                  id="ifsc"
                  value={form.ifsc}
                  onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                  placeholder="e.g. HDFC0001234"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={form.accountType} onValueChange={(v) => setForm({ ...form, accountType: v || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.isDefault}
                  onCheckedChange={(v) => setForm({ ...form, isDefault: Boolean(v) })}
                />
                <span>Set as default account</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Add Account
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
          Failed to load bank accounts. Please try again.
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
          <Landmark className="mb-2 h-8 w-8" />
          No bank accounts saved yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" />
                    {account.bankName}
                  </span>
                  {account.isDefault && <Badge>Default</Badge>}
                </CardTitle>
                <CardDescription>{account.holderName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-mono text-lg tracking-wider">{account.accountNumber}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>IFSC: {account.ifsc}</span>
                  <span>•</span>
                  <span className="capitalize">{account.accountType}</span>
                </div>
                <Badge variant={statusVariant[account.status] || "secondary"}>
                  {account.status.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
