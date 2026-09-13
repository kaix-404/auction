const { createServer } = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const PORT = Number(process.env.PORT) || 3000;
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

const app = next({
  dev,
  hostname: HOSTNAME,
  port: PORT,
});
const handler = app.getRequestHandler();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const subscriber = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  io.on("connection", (socket) => {
    socket.on("join-auction", (auctionId) => {
      socket.join(`auction:${auctionId}`);
    });

    socket.on("leave-auction", (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    socket.on("disconnect", () => {});
  });

  subscriber.subscribe("auction-events", (err) => {
    if (err) {
      console.error("Redis subscribe error:", err);
    }
  });

  subscriber.on("message", (channel, message) => {
    if (channel !== "auction-events") return;
    try {
      const { auctionId, event, data } = JSON.parse(message);
      io.to(`auction:${auctionId}`).emit(event, { ...data, auctionId });
    } catch (e) {
      console.error("Socket broadcast error:", e.message);
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`> Auction server ready on http://${HOSTNAME}:${PORT}`);
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      console.log(`  Public URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
  });
});
