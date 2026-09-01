"use client";

import {
  BarChart,
  IndianRupee,
  Wallet,
  Clock,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function AdminReportsPage() {
  const sections = [
    {
      title: "Auction Performance",
      icon: BarChart,
      description: "Live auction metrics and outcomes.",
      rows: [
        { label: "Live Auctions", value: "12" },
        { label: "Scheduled Auctions", value: "18" },
        { label: "Ended (this month)", value: "26" },
        { label: "Avg. Bids per Auction", value: "34" },
        { label: "Avg. Bid Amount", value: formatCurrency(128500) },
      ],
    },
    {
      title: "Revenue Summary",
      icon: IndianRupee,
      description: "Revenue from fees, commissions and sales.",
      rows: [
        { label: "Total Revenue", value: formatCurrency(2458000) },
        { label: "Participation Fees", value: formatCurrency(642000) },
        { label: "GST Collected", value: formatCurrency(214000) },
        { label: "This Month", value: formatCurrency(318000) },
      ],
    },
    {
      title: "EMD Overview",
      icon: Wallet,
      description: "Earnest money deposit position.",
      rows: [
        { label: "Total EMD Locked", value: formatCurrency(980000) },
        { label: "EMD Released", value: formatCurrency(410000) },
        { label: "EMD Pending Refund", value: formatCurrency(132000) },
        { label: "EMD Adjusted to Purchase", value: formatCurrency(438000) },
      ],
    },
    {
      title: "Refund Ageing",
      icon: Clock,
      description: "Aging of pending refunds by SLA buckets.",
      rows: [
        { label: "0-3 days", value: "8" },
        { label: "4-7 days", value: "5" },
        { label: "8-14 days", value: "2" },
        { label: "15+ days", value: "1" },
        { label: "Overdue", value: "3" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Summary reports for platform performance and operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="space-y-1 px-6 pb-6">
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
