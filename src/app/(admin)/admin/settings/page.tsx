"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Gavel,
  CreditCard,
  BellRing,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuctionSettings {
  participationFeePct: string;
  emdPct: string;
  gstRate: string;
  defaultBidIncrement: string;
}

interface PaymentSettings {
  paymentDeadlineDays: string;
  refundSLADays: string;
}

export default function AdminSettingsPage() {
  const [auction, setAuction] = useState<AuctionSettings>({
    participationFeePct: "1",
    emdPct: "10",
    gstRate: "18",
    defaultBidIncrement: "1000",
  });
  const [payment, setPayment] = useState<PaymentSettings>({
    paymentDeadlineDays: "3",
    refundSLADays: "7",
  });
  const [savingAuction, setSavingAuction] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const setAuctionField = (key: keyof AuctionSettings, value: string) =>
    setAuction((a) => ({ ...a, [key]: value }));

  const setPaymentField = (key: keyof PaymentSettings, value: string) =>
    setPayment((p) => ({ ...p, [key]: value }));

  const saveAuction = async () => {
    setSavingAuction(true);
    try {
      await new Promise((res) => setTimeout(res, 400));
      toast.success("Auction settings saved");
    } finally {
      setSavingAuction(false);
    }
  };

  const savePayment = async () => {
    setSavingPayment(true);
    try {
      await new Promise((res) => setTimeout(res, 400));
      toast.success("Payment settings saved");
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-primary" />
              Auction Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Participation Fee (%)</Label>
                <Input
                  type="number"
                  value={auction.participationFeePct}
                  onChange={(e) =>
                    setAuctionField("participationFeePct", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>EMD (%)</Label>
                <Input
                  type="number"
                  value={auction.emdPct}
                  onChange={(e) => setAuctionField("emdPct", e.target.value)}
                />
              </div>
              <div>
                <Label>GST Rate (%)</Label>
                <Input
                  type="number"
                  value={auction.gstRate}
                  onChange={(e) => setAuctionField("gstRate", e.target.value)}
                />
              </div>
              <div>
                <Label>Default Bid Increment (₹)</Label>
                <Input
                  type="number"
                  value={auction.defaultBidIncrement}
                  onChange={(e) =>
                    setAuctionField("defaultBidIncrement", e.target.value)
                  }
                />
              </div>
            </div>
            <Button onClick={saveAuction} disabled={savingAuction}>
              {savingAuction && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Auction Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Winner Payment Deadline (days)</Label>
              <Input
                type="number"
                value={payment.paymentDeadlineDays}
                onChange={(e) =>
                  setPaymentField("paymentDeadlineDays", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Refund SLA (days)</Label>
              <Input
                type="number"
                value={payment.refundSLADays}
                onChange={(e) =>
                  setPaymentField("refundSLADays", e.target.value)
                }
              />
            </div>
            <Button onClick={savePayment} disabled={savingPayment}>
              {savingPayment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Payment Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              Notification Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Eligibility granted</span>
              <Badge variant="secondary">Version 3</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Payment verified</span>
              <Badge variant="secondary">Version 2</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Payment rejected</span>
              <Badge variant="secondary">Version 1</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Refund completed</span>
              <Badge variant="secondary">Version 3</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Terms & Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Terms of Service</span>
              <span className="font-medium">v1.4</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Auction Rules</span>
              <span className="font-medium">v2.1</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Refund Policy</span>
              <span className="font-medium">v1.2</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Privacy Policy</span>
              <span className="font-medium">v1.1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
