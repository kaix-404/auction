import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Refund from "@/models/Refund";
import Auction from "@/models/Auction";
import AuctionParticipant from "@/models/AuctionParticipant";
import EmdLedger from "@/models/EmdLedger";
import BankAccount from "@/models/BankAccount";
import User from "@/models/User";
import { requireAdmin } from "@/lib/rbac";
import { getAuthContext, getClientIp } from "@/lib/api";
import { writeAuditLog, writeNotification } from "@/lib/audit";
import { writeEmdLedger } from "@/lib/ledger";
import { refundQueue } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = { userId: context.userId };
    if (status) query.status = status;

    const refunds = await Refund.find(query)
      .populate("auctionId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ refunds });
  } catch (err) {
    console.error("List refunds error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "refunds")();
    if ("error" in guard) return guard.error;

    const body = await request.json();
    const { auctionId } = body;

    if (!auctionId) {
      return NextResponse.json({ error: "auctionId is required" }, { status: 400 });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });

    const participants = await AuctionParticipant.find({
      auctionId,
      emdLocked: true,
    });

    const winnerId = auction.winner ? String(auction.winner) : null;

    let created = 0;
    for (const participant of participants) {
      if (winnerId && String(participant.userId) === winnerId) continue;

      const emd = await EmdLedger.findOne({
        userId: participant.userId,
        auctionId,
        type: "locked",
      });
      if (!emd) continue;

      const existingRefund = await Refund.findOne({
        userId: participant.userId,
        auctionId,
        status: { $in: ["pending_review", "approved", "processing", "paid"] },
      });
      if (existingRefund) continue;

      const bankAccount = await BankAccount.findOne({
        userId: participant.userId,
        isDefault: true,
      }).select("_id");

      const refund = await Refund.create({
        refundId: `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        userId: participant.userId,
        auctionId,
        emdLedgerId: emd._id,
        amount: emd.amount,
        bankAccountId: bankAccount ? bankAccount._id : undefined,
        status: "pending_review",
      });

      await writeEmdLedger({
        userId: String(participant.userId),
        auctionId,
        amount: emd.amount,
        type: "refunded",
        refundId: refund._id.toString(),
        notes: "EMD refund initiated for unsuccessful bidder",
        processedBy: guard.context.userId,
      });

      created++;
    }

    await writeAuditLog({
      eventType: "refund.create",
      actorId: guard.context.userId,
      actorRole: guard.context.role,
      action: "create_refunds",
      entityType: "refund",
      entityId: auctionId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { auctionId, refundsCreated: created },
      reason: "Generated EMD refunds for unsuccessful bidders",
    });

    return NextResponse.json({ message: `Created ${created} refunds` }, { status: 201 });
  } catch (err) {
    console.error("Create refunds error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
