import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import PaymentSubmission from "@/models/PaymentSubmission";
import Payment from "@/models/Payment";
import AuctionParticipant from "@/models/AuctionParticipant";
import Auction from "@/models/Auction";
import User from "@/models/User";
import { requireAdmin } from "@/lib/rbac";
import { getClientIp } from "@/lib/api";
import { writeAuditLog, writeNotification } from "@/lib/audit";
import { writeFinancialLedger, writeEmdLedger } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const guard = await requireAdmin(request, "payments")();
    if ("error" in guard) return guard.error;

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;
    const adminOid = guard.context.userId as unknown as mongoose.Types.ObjectId;

    if (!action || !["verify", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be verify or reject" }, { status: 400 });
    }

    const submission = await PaymentSubmission.findById(id);
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    const submissionObj = submission.toObject();

    if (action === "reject" && !reason) {
      return NextResponse.json({ error: "Reason required for rejection" }, { status: 400 });
    }

    if (action === "verify") {
      submission.status = "verified";
      submission.reviewedBy = adminOid;
      submission.reviewedAt = new Date();
      await submission.save();

      if (submission.paymentId) {
        await Payment.findByIdAndUpdate(submission.paymentId, {
          status: "verified",
          verifiedBy: adminOid,
          verifiedAt: new Date(),
        });
      }

      const payment = submission.paymentId
        ? await Payment.findById(submission.paymentId)
        : null;

      const participant = await AuctionParticipant.findOne({
        auctionId: submission.auctionId,
        userId: submission.userId,
      });

      if (participant) {
        if (payment && payment.type === "participation_fee") {
          participant.participationFeeVerified = true;
        }
        if (payment && payment.type === "emd") {
          participant.emdVerified = true;
          participant.emdLocked = true;
        }
        if (payment && payment.type === "balance") {
          participant.balanceVerified = true;
          participant.won = true;
        }

        const bothVerified =
          participant.participationFeeVerified && participant.emdVerified;
        const becameEligible =
          bothVerified && participant.eligibilityStatus !== "eligible";

        if (becameEligible) {
          participant.eligibilityStatus = "eligible";
          await writeNotification({
            userId: String(submission.userId),
            type: "eligibility",
            title: "You are now eligible to bid!",
            body: `Your participation fee and EMD for this auction are verified. You can now place bids.`,
            metadata: { auctionId: String(submission.auctionId) },
          });

          await Auction.findByIdAndUpdate(submission.auctionId, {
            $inc: { participantCount: 1 },
          });
        }
        if (bothVerified) {
          participant.eligibilityStatus = "eligible";
        } else {
          participant.eligibilityStatus = "pending_eligible";
        }
        await participant.save();
      }

      const adminUser = await User.findById(guard.context.userId).select("email");
      const userName = adminUser?.email || guard.context.userId;

      await writeAuditLog({
        eventType: "payment.verify",
        actorId: guard.context.userId,
        actorRole: guard.context.role,
        action: "verify_payment",
        entityType: "payment",
        entityId: id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || "",
        afterValues: { submissionId: id, status: "verified", by: userName },
        reason: reason || "Payment verified",
      });

      if (payment) {
        const ledgerType =
          payment.type === "participation_fee"
            ? "participation_fee"
            : payment.type === "balance"
              ? "winner_balance_received"
              : "emd_received";
        await writeFinancialLedger({
          eventType: ledgerType,
          userId: String(submission.userId),
          auctionId: String(submission.auctionId),
          amount: payment.amount,
          gstComponent: payment.gstComponent || 0,
          status: "verified",
          sourceTransactionId: submission.utr,
          notes: `${payment.type} verified`,
        });

        if (payment.type === "emd") {
          await writeEmdLedger({
            userId: String(submission.userId),
            auctionId: String(submission.auctionId),
            amount: payment.amount,
            type: "locked",
            paymentSubmissionId: submission._id.toString(),
            notes: "EMD locked on verification",
            processedBy: guard.context.userId,
          });
        }

        await writeNotification({
          userId: String(submission.userId),
          type: "payment_verified",
          title: "Payment verified",
          body: `Your ${payment.type.replace("_", " ")} payment was verified successfully.`,
          metadata: { auctionId: String(submission.auctionId) },
        });
      }

      return NextResponse.json({ message: "Payment verified", submission }, { status: 200 });
    } else {
      submission.status = "rejected";
      submission.rejectionReason = reason;
      submission.reviewedBy = adminOid;
      submission.reviewedAt = new Date();
      await submission.save();

      if (submission.paymentId) {
        await Payment.findByIdAndUpdate(submission.paymentId, {
          status: "rejected",
          verifiedBy: adminOid,
          verifiedAt: new Date(),
        });
      }

      await writeAuditLog({
        eventType: "payment.reject",
        actorId: guard.context.userId,
        actorRole: guard.context.role,
        action: "reject_payment",
        entityType: "payment",
        entityId: id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || "",
        afterValues: { submissionId: id, status: "rejected" },
        reason,
      });

      await writeNotification({
        userId: String(submission.userId),
        type: "payment_rejected",
        title: "Payment rejected",
        body: `Your payment submission was rejected. Reason: ${reason}`,
        metadata: { auctionId: String(submission.auctionId) },
      });

      return NextResponse.json({ message: "Payment rejected", submission }, { status: 200 });
    }
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
