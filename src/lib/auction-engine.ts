import dbConnect from "@/lib/mongodb";

export interface BidRequest {
  auctionId: string;
  userId: string;
  amount: number;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface BidResult {
  success: boolean;
  reason?: string;
  bid?: {
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
    timestamp: Date;
    previousBidAmount?: number;
    currentHighestBidAfter?: number;
  };
}

export async function placeBid(req: BidRequest): Promise<BidResult> {
  await dbConnect();

  const Auction = (await import("@/models/Auction")).default;
  const Bid = (await import("@/models/Bid")).default;
  const AuctionParticipant = (await import("@/models/AuctionParticipant")).default;
  const User = (await import("@/models/User")).default;

  const auction = await Auction.findById(req.auctionId);
  if (!auction) {
    return { success: false, reason: "Auction not found" };
  }

  const now = Date.now();
  if (auction.status !== "live" && auction.status !== "registration_open") {
    return { success: false, reason: `Auction is not accepting bids (status: ${auction.status})` };
  }

  const startTime = new Date(auction.startDate).getTime();
  const endTime = new Date(auction.endDate).getTime();
  if (now < startTime) return { success: false, reason: "Auction has not started yet" };
  if (now > endTime) return { success: false, reason: "Auction has ended" };

  const user = await User.findById(req.userId);
  if (!user) return { success: false, reason: "User not found" };
  if (user.status !== "active") {
    return { success: false, reason: `Account not active (status: ${user.status})` };
  }

  const participant = await AuctionParticipant.findOne({
    auctionId: req.auctionId,
    userId: req.userId,
  });

  if (!participant || participant.eligibilityStatus !== "eligible") {
    return { success: false, reason: "User is not eligible to bid on this auction" };
  }

  const minNextBid = (auction.currentBidAmount || 0) + auction.bidIncrement;

  if (req.amount < minNextBid) {
    await recordRejectedBid(req, "Bid below minimum increment");
    return {
      success: false,
      reason: `Bid must be at least ${minNextBid}`,
    };
  }

  const butler = await Bid.findOne({ requestId: req.requestId });
  if (butler) {
    return { success: false, reason: "Duplicate bid request" };
  }

  const bidToCreate = {
    auctionId: req.auctionId,
    userId: req.userId,
    amount: req.amount,
    previousBidAmount: auction.currentBidAmount || undefined,
    currentHighestBidAfter: req.amount,
    status: "accepted",
    requestId: req.requestId,
    ipAddress: req.ipAddress,
    userAgent: req.userAgent,
  };

  const session = await Bid.startSession();
  let result: BidResult = { success: false };

  try {
    await session.withTransaction(async () => {
      const freshAuction = await Auction.findOne({
        _id: req.auctionId,
      }).session(session);

      if (!freshAuction) throw new Error("Auction not found");

      if (freshAuction.currentBidAmount + freshAuction.bidIncrement > req.amount) {
        throw new Error(`Bid below minimum increment (current ${freshAuction.currentBidAmount})`);
      }

      const bid = await Bid.create([bidToCreate], { session });
      const createdBid = bid[0];

      await Auction.findByIdAndUpdate(
        req.auctionId,
        {
          $set: {
            currentBidAmount: req.amount,
            currentHighestBidder: req.userId,
          },
          $inc: { bidCount: 1 },
        },
        { session }
      );

      result = {
        success: true,
        bid: {
          id: createdBid._id.toString(),
          auctionId: req.auctionId,
          userId: req.userId,
          amount: createdBid.amount,
          timestamp: createdBid.timestamp,
          previousBidAmount: createdBid.previousBidAmount,
          currentHighestBidAfter: createdBid.currentHighestBidAfter,
        },
      };
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bid failed";
    result = { success: false, reason: message };
  } finally {
    await session.endSession();
  }

  return result;
}

async function recordRejectedBid(
  req: BidRequest,
  reason: string
): Promise<void> {
  try {
    const Bid = (await import("@/models/Bid")).default;
    await Bid.create({
      auctionId: req.auctionId,
      userId: req.userId,
      amount: req.amount,
      status: "rejected",
      rejectReason: reason,
      requestId: req.requestId,
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
    });
  } catch (err) {
    console.error("Failed to record rejected bid:", err);
  }
}
