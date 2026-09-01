"use node";
import "dotenv/config";
import { Worker } from "bullmq";
import mongoose from "mongoose";
import { redisConnection } from "../src/lib/redis";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/auction_platform";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const BankReconciliation = (await import("../src/models/BankReconciliation")).default;
  const PaymentSubmission = (await import("../src/models/PaymentSubmission")).default;
  const Refund = (await import("../src/models/Refund")).default;

  const worker = new Worker(
    "reconciliation",
    async (job) => {
      const { transactionId } = job.data;

      const recon = await BankReconciliation.findById(transactionId);
      if (!recon) {
        throw new Error(`Reconciliation record ${transactionId} not found`);
      }

      if (recon.status !== "unmatched") {
        console.log(`Recon ${transactionId} already ${recon.status}`);
        return { transactionId, skipped: true };
      }

      const submission = await PaymentSubmission.findOne({
        utr: recon.utr,
        amount: recon.amount,
      });

      if (submission) {
        recon.matchedPaymentId = submission._id;
        recon.userId = submission.userId;
        recon.status = "matched";
        recon.notes = "Auto-matched by UTR + amount";
        await recon.save();
        console.log(`Recon ${transactionId} matched to submission ${submission._id}`);
      } else {
        recon.status = "unmatched";
        await recon.save();
        console.log(`Recon ${transactionId} remains unmatched`);
      }

      return { transactionId, status: recon.status };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Reconciliation job ${job?.id} failed:`, err.message);
  });

  console.log("Reconciliation worker running");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
