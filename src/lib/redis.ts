import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let _connection: Redis | null = null;
let _subscriber: Redis | null = null;

function handleRedisError(err: unknown) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    console.error("Redis error:", err);
  }
}

export function getRedisConnection(): Redis {
  if (!_connection) {
    _connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    _connection.on("error", handleRedisError);
    _connection.connect().catch(() => {
      /* noop - will retry lazily */
    });
  }
  return _connection;
}

export function getRedisSubscriber(): Redis {
  if (!_subscriber) {
    _subscriber = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    _subscriber.on("error", handleRedisError);
    _subscriber.connect().catch(() => {
      /* noop */
    });
  }
  return _subscriber;
}

export const redisConnection = getRedisConnection();
export default redisConnection;
