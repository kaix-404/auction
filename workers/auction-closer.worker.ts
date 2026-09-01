"use node";
import "dotenv/config";
import { Worker } from "bullmq";
import mongoose from "mongoose";
import { redisConnection } from "../src/lib/redis";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/auction_platform";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const Bid = (await import("../src/models/Bid")).default;
  const Auction = (await import("../src/models/Auction")).default;
  const AuctionParticipant = (await import("../src/models/AuctionParticipant")).default;

  const worker = new Worker(
    "auction-close",
    async (job) => {
      const { auctionId } = job.data;

      const auction = await Auction.findById(auctionId);
      if (!auction) {
        console.log(`Auction ${auctionId} not found`);
        return;
      }

      if (auction.status !== "live" && auction.status !== "registration_open") {
        console.log(`Auction ${auctionId} already in state ${auction.status}`);
        return;
      }

      if (new Date().getTime() < new Date(auction.endDate).getTime()) {
        console.log(`Auction ${auctionId} not yet ended, rescheduling`);
        throw new Error("Auction not yet ended");
      }

      const highestBid = await Bid.findOne({ auctionId: auction._id, status: "accepted" })
        .sort({ amount: -1, timestamp: 1 })
        .populate("userId");

      if (highestBid) {
        auction.status = "ended";
        auction.currentBidAmount = highestBid.amount;
        auction.currentHighestBidder = highestBid.userId;
        auction.winningBid = highestBid._id;
        auction.winner = highestBid.userId;
        await auction.save();

        console.log(`Auction ${auctionId} closed, winner: ${highestBid.userId} @ ₹${highestBid.amount}`);
      } else {
        auction.status = "ended";
        await auction.save();
        console.log(`Auction ${auctionId} closed with no bids`);
      }

      return { auctionId, closed: true };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Auction close job ${job?.id} failed:`, err.message);
  });
  worker.on("completed", (job) => {
    console.log(`Auction close job ${job.id} completed`);
  });

  console.log("Auction closer worker running");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
