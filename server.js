const { createServer } = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  hostname: process.env.HOSTNAME || "localhost",
  port: Number(process.env.PORT) || 3000,
});
const handler = app.getRequestHandler();

const SOCKET_PORT = Number(process.env.SOCKET_PORT || 3005);
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

  httpServer.listen(SOCKET_PORT, () => {
    console.log(`> Socket.io ready on port ${SOCKET_PORT}`);
  });
});
