"use node";
import "dotenv/config";
import { Worker } from "bullmq";
import mongoose from "mongoose";
import { redisConnection } from "../src/lib/redis";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/auction_platform";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const Notification = (await import("../src/models/Notification")).default;

  const worker = new Worker(
    "notifications",
    async (job) => {
      const { userId, type, title, body, metadata } = job.data;

      await Notification.create({
        userId,
        type,
        title,
        body,
        channels: ["email", "sms"],
        sentChannels: [],
        metadata,
      });

      console.log(`Notification ${type} queued for user ${userId}`);
      return { delivered: true };
    },
    {
      connection: redisConnection,
      concurrency: 10,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Notification job ${job?.id} failed:`, err.message);
  });

  console.log("Notification worker running");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
