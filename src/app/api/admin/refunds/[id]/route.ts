import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Refund from "@/models/Refund";
import { requireAdmin } from "@/lib/rbac";
import { getClientIp } from "@/lib/api";
import { writeAuditLog, writeNotification } from "@/lib/audit";
import { writeFinancialLedger } from "@/lib/ledger";
import { refundQueue } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "refunds")();
    if ("error" in guard) return guard.error;

    const { id } = await params;
    const body = await request.json();
    const { action, utr, reason } = body;

    if (!action || !["approve", "process", "fail", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const refund = await Refund.findById(id);
    if (!refund) return NextResponse.json({ error: "Refund not found" }, { status: 404 });

    switch (action) {
      case "approve":
        refund.status = "approved";
        break;
      case "process":
        if (!utr) {
          return NextResponse.json({ error: "UTR required to process refund" }, { status: 400 });
        }
        refund.status = "paid";
        refund.utr = utr;
        refund.processedBy = guard.context.userId as unknown as typeof refund.processedBy;
        refund.processedAt = new Date();
        break;
      case "fail":
        refund.status = "failed";
        refund.failureReason = reason || "Processing failed";
        break;
      case "cancel":
        refund.status = "cancelled";
        break;
    }

    await refund.save();

    await writeAuditLog({
      eventType: `refund.${action}`,
      actorId: guard.context.userId,
      actorRole: guard.context.role,
      action: `${action}_refund`,
      entityType: "refund",
      entityId: id,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { refundId: id, status: refund.status, utr: utr || undefined },
      reason,
    });

    if (action === "process") {
      await writeFinancialLedger({
        eventType: "refund",
        userId: String(refund.userId),
        auctionId: String(refund.auctionId),
        amount: refund.amount,
        status: "paid",
        referenceId: id,
        sourceTransactionId: utr,
        notes: "EMD refund processed",
      });

      await writeNotification({
        userId: String(refund.userId),
        type: "refund_completed",
        title: "Refund completed",
        body: `Your EMD refund of ₹${refund.amount} has been processed. UTR: ${utr}`,
        metadata: { auctionId: String(refund.auctionId), refundId: id },
      });

      if (refund.retryCount === 0) {
        await refundQueue.add("process-refund", { refundId: id });
      }
    }

    return NextResponse.json({ refund });
  } catch (err) {
    console.error("Admin refund action error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
