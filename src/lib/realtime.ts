import { Redis } from "ioredis";

interface AuctionEvent {
  auctionId: string;
  event: "bid-update" | "auction-closed";
  data: {
    currentBidAmount?: number;
    currentHighestBidder?: string;
    bid?: unknown;
    winner?: string;
    winningBid?: number;
  };
}

let publisher: Redis | null = null;

function getPublisher(): Redis {
  if (!publisher) {
    publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });
    publisher.connect().catch((err) => {
      console.error("Realtime Redis connect error:", err);
    });
  }
  return publisher;
}

export async function publishAuctionEvent(payload: AuctionEvent): Promise<void> {
  try {
    const pub = getPublisher();
    await pub.publish(
      "auction-events",
      JSON.stringify({
        auctionId: payload.auctionId,
        event: payload.event,
        data: payload.data,
      })
    );
  } catch (err) {
    console.error("Failed to publish auction event:", err);
  }
}
