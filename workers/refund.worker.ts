"use node";
import "dotenv/config";
import { Worker } from "bullmq";
import mongoose from "mongoose";
import { redisConnection } from "../src/lib/redis";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/auction_platform";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const Refund = (await import("../src/models/Refund")).default;

  const worker = new Worker(
    "refunds",
    async (job) => {
      const { refundId } = job.data;
      const refund = await Refund.findById(refundId);

      if (!refund) {
        throw new Error(`Refund ${refundId} not found`);
      }

      if (refund.status === "paid" || refund.status === "cancelled") {
        console.log(`Refund ${refundId} already in ${refund.status}`);
        return { refundId, skipped: true };
      }

      refund.status = "processing";
      refund.retryCount = (refund.retryCount || 0) + 1;
      await refund.save();

      console.log(`Refund ${refundId} processing (attempt ${refund.retryCount})`);
      return { refundId, processing: true };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Refund job ${job?.id} failed:`, err.message);
  });

  console.log("Refund worker running");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
