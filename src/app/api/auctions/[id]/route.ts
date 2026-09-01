import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Auction from "@/models/Auction";
import Product from "@/models/Product";
import Bid from "@/models/Bid";
import AuctionParticipant from "@/models/AuctionParticipant";
import { getAuthContext } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const auction = await Auction.findById(id)
      .populate("productId")
      .populate("winner", "email mobile")
      .populate("currentHighestBidder", "email mobile")
      .lean();

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const recentBids = await Bid.find({ auctionId: id, status: "accepted" })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("userId", "email mobile")
      .lean();

    const context = await getAuthContext(request);
    let participant = null;
    if (context) {
      participant = await AuctionParticipant.findOne({
        auctionId: id,
        userId: context.userId,
      }).lean();
    }

    return NextResponse.json({
      auction,
      recentBids,
      participant,
      me: context ? { userId: context.userId, role: context.role } : null,
    });
  } catch (err) {
    console.error("Get auction detail error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
