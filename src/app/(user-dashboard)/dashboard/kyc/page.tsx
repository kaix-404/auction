"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Clock, XCircle } from "lucide-react";

export default function KycPage() {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentImageUrl, setDocumentImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("not_submitted");

  const handleSubmit = async () => {
    if (!documentType) {
      toast.error("Please select a document type");
      return;
    }
    if (!documentNumber.trim()) {
      toast.error("Please enter the document number");
      return;
    }
    if (!documentImageUrl.trim()) {
      toast.error("Please provide a document image URL");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/users/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, documentNumber, documentImageUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit KYC");
      }
      setStatus("pending");
      toast.success("KYC submitted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" }> = {
    not_submitted: { label: "Not Submitted", icon: <Clock className="size-3" />, variant: "secondary" },
    pending: { label: "Pending Review", icon: <ShieldCheck className="size-3" />, variant: "secondary" },
    verified: { label: "Verified", icon: <ShieldCheck className="size-3" />, variant: "default" },
    rejected: { label: "Rejected", icon: <XCircle className="size-3" />, variant: "destructive" },
  };

  const current = statusConfig[status] || statusConfig.not_submitted;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-muted-foreground">Complete your identity verification to participate in auctions.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Your KYC verification status</CardDescription>
          </div>
          <Badge variant={current.variant}>{current.icon}{current.label}</Badge>
        </CardHeader>
      </Card>

      {status !== "verified" && (
        <Card>
          <CardHeader>
            <CardTitle>Submit KYC</CardTitle>
            <CardDescription>Upload your identity document for verification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v || "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhaar</SelectItem>
                  <SelectItem value="pan">PAN Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                  <SelectItem value="voter_id">Voter ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Enter document number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentImageUrl">Document Image URL</Label>
              <Input
                id="documentImageUrl"
                value={documentImageUrl}
                onChange={(e) => setDocumentImageUrl(e.target.value)}
                placeholder="https://example.com/document.jpg"
              />
              {documentImageUrl && (
                <div className="relative mt-2 h-48 w-full overflow-hidden rounded-lg border">
                  <Image
                    src={documentImageUrl}
                    alt="Document preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Submit KYC
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
