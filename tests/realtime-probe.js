const { io } = require("socket.io-client");
const BASE = "http://localhost:3005";
const out = (m) => process.stdout.write(m + "\n");
const stamp = Date.now();
const email = `rt${stamp}@test.com`;
const mobile = String(9020000000 + (stamp % 90000000)).slice(0, 10);
const password = "Test@12345";
const j = JSON.stringify;

(async () => {
  // register + verify
  await fetch(BASE + "/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: j({ email, mobile, password, fullName: "RT User" }) });
  const Redis = require("ioredis");
  const c = new Redis("redis://127.0.0.1:6379");
  const otp = await c.get("otp:" + email); await c.quit();
  await fetch(BASE + "/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: j({ identifier: email, otp, purpose: "registration" }) });
  // promote + re-login
  const { MongoClient, ObjectId } = require("mongodb");
  const mc = new MongoClient("mongodb://127.0.0.1:27017/auction_platform");
  await mc.connect();
  const users = mc.db().collection("users");
  const u = await users.findOne({ email });
  await users.updateOne({ _id: u._id }, { $set: { role: "super_admin", status: "active" } });
  let r = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: j({ identifier: email, password }) });
  let d = await r.json();
  const token = d.token;
  const H = { "Content-Type": "application/json", Cookie: "auction_token=" + token };
  // product + auction
  r = await fetch(BASE + "/api/products", { method: "POST", headers: H, body: j({ title: "RT Product", brand: "X", condition: "new", costPrice: 500, description: "rt", categoryId: new ObjectId().toString() }) });
  const pid = (await r.json()).product._id;
  const start = new Date(Date.now() - 60000).toISOString(), end = new Date(Date.now() + 600000).toISOString();
  r = await fetch(BASE + "/api/auctions", { method: "POST", headers: H, body: j({ productId: pid, title: "RT Auction", reservePrice: 1000, bidIncrement: 100, participationFee: 50, emdAmount: 500, startDate: start, endDate: end, status: "live" }) });
  const auc = await r.json();
  const aid = auc._id;
  out("auction " + aid);
  // fee + emd -> verify
  async function payVerify(type, amount, utr) {
    r = await fetch(BASE + "/api/payments", { method: "POST", headers: H, body: j({ auctionId: aid, type, amount, utr, method: "upi", paymentDate: new Date().toISOString().slice(0, 10) }) });
    const sub = (await r.json()).submission;
    r = await fetch(BASE + "/api/admin/payments/" + sub._id, { method: "POST", headers: H, body: j({ action: "verify" }) });
    return r.status;
  }
  out("verify fee -> " + (await payVerify("participation_fee", 50, "RTPF" + stamp)));
  out("verify emd -> " + (await payVerify("emd", 500, "RTE" + stamp)));

  // socket client joins auction
  const socket = io(BASE, { transports: ["websocket"], reconnection: false, timeout: 8000 });
  const got = [];
  socket.on("connect", () => out("socket connected: " + socket.id));
  socket.on("bid-update", (payload) => { got.push(payload); out("BID-UPDATE RECEIVED: " + j(payload).slice(0, 200)); });
  socket.on("connect_error", (e) => out("socket connect_error: " + e.message));
  await new Promise((res, rej) => { socket.once("connect", res); socket.once("connect_error", rej); });
  socket.emit("join-auction", aid);

  // allow subscription to propagate then bid
  await new Promise((r2) => setTimeout(r2, 800));
  r = await fetch(BASE + "/api/bids", { method: "POST", headers: H, body: j({ auctionId: aid, amount: 1200 }) });
  out("bid status " + r.status + ": " + (await r.text()).slice(0, 120));

  await new Promise((r2) => setTimeout(r2, 1500));
  const ok = got.length >= 1 && got[0].currentBidAmount === 1200;
  out(ok ? "REALTIME PASS"
    : got.length === 0 ? "REALTIME FAIL: no bid-update received"
      : "REALTIME FAIL: unexpected payload " + j(got));
  socket.disconnect();
  await mc.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { out("SCRIPT ERROR: " + (e.stack || e.message)); process.exit(1); });