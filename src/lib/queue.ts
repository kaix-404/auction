import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 2000 },
  removeOnComplete: { age: 24 * 3600, count: 5000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

let _auctionClose: Queue | null = null;
let _notification: Queue | null = null;
let _refund: Queue | null = null;
let _reconciliation: Queue | null = null;

export function getAuctionCloseQueue(): Queue {
  if (!_auctionClose) {
    _auctionClose = new Queue("auction-close", {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return _auctionClose;
}

export function getNotificationQueue(): Queue {
  if (!_notification) {
    _notification = new Queue("notifications", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential" as const, delay: 1000 },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: { age: 14 * 24 * 3600 },
      },
    });
  }
  return _notification;
}

export function getRefundQueue(): Queue {
  if (!_refund) {
    _refund = new Queue("refunds", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential" as const, delay: 5000 },
        removeOnComplete: { age: 30 * 24 * 3600 },
        removeOnFail: { age: 30 * 24 * 3600 },
      },
    });
  }
  return _refund;
}

export function getReconciliationQueue(): Queue {
  if (!_reconciliation) {
    _reconciliation = new Queue("reconciliation", {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return _reconciliation;
}

export const auctionCloseQueue = getAuctionCloseQueue();
export const notificationQueue = getNotificationQueue();
export const refundQueue = getRefundQueue();
export const reconciliationQueue = getReconciliationQueue();
