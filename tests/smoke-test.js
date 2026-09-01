const BASE = "http://localhost:3005";
const out = (m) => { process.stdout.write(m + "\n"); };

process.on("unhandledRejection", (e) => { out("UNHANDLED: " + e.message); process.exit(9); });

const api = async (path, { method = "GET", body, token } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Cookie"] = `auction_token=${token}`;
  const res = await fetch(BASE + path, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, data };
};

const log = (label, p) => {
  const s = p.status;
  const mark = s >= 200 && s < 300 ? "PASS" : "FAIL";
  out(`[${mark}:${s}] ${label}`);
  if (p.data && (s >= 300 || process.env.VERBOSE)) out("      -> " + JSON.stringify(p.data).slice(0, 500));
  return p;
};

(async () => {
  out("=== SMOKE TEST START ===");
  const results = [];
  const stamp = Date.now();
  const email = `user${stamp}@test.com`;
  const mobile = String(9000000000 + (stamp % 90000000)).slice(0, 10);
  const password = "Test@12345";

  let r = await api("/api/auth/register", { method: "POST", body: { email, mobile, password, fullName: "Test User" } });
  log("register", r);
  results.push(["register", r.status]);

  const Redis = require("ioredis");
  const rcli = new Redis("redis://127.0.0.1:6379");
  let otp;
  try { otp = await rcli.get(`otp:${email}`); } catch (e) { otp = ""; }
  await rcli.quit();
  if (otp) { out("[PASS] OTP from Redis: " + otp); results.push(["otp_fetch", 200]); }
  else { out("[FAIL] no OTP"); results.push(["otp_fetch", 500]); }

  if (otp) {
    r = await api("/api/auth/verify-otp", { method: "POST", body: { identifier: email, otp, purpose: "registration" } });
    log("verify-otp", r);
    results.push(["verify_otp", r.status]);
  }

  r = await api("/api/auth/login", { method: "POST", body: { identifier: email, password } });
  log("login", r);
  results.push(["login", r.status]);

  const mongoUser = await dbConnectForFixture(email);
  out("Promoted user id: " + mongoUser._id + " role=" + mongoUser.role);

  // Re-login to get a token carrying the super_admin role
  r = await api("/api/auth/login", { method: "POST", body: { identifier: email, password } });
  log("re-login (admin)", r);
  out("Re-login user role: " + (r.data && r.data.user && r.data.user.role));
  out("Login user: " + JSON.stringify(r.data && r.data.user).slice(0, 300));
  const decoded = r.data && r.data.token ? JSON.parse(Buffer.from(r.data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()) : null;
  out("JWT claims: " + JSON.stringify(decoded));
  results.push(["relogin_admin", r.status]);
  const adminToken = r.data && r.data.token;
  if (!adminToken) { out("ABORT: no admin token"); process.exit(0); }
  const token = adminToken;

  r = await api("/api/products", { method: "POST", token, body: {
    title: "iPhone 15 Pro (Test)", brand: "Apple", model: "15 Pro", condition: "like_new",
    costPrice: 60000, marketPrice: 120000, description: "Test",
    categoryId: new (require("mongoose").Types.ObjectId)().toString(), warranty: 12, images: []
  }});
  log("create product", r);
  results.push(["create_product", r.status]);
  const product = r.data && r.data.product;
  out("Product id: " + (product && (product._id || product.id)));

  const start = new Date(Date.now() - 60000).toISOString();
  const end = new Date(Date.now() + 20 * 60000).toISOString();
  r = await api("/api/auctions", { method: "POST", token, body: {
    productId: product && (product._id || product.id), title: "iPhone Auction",
    reservePrice: 50000, bidIncrement: 1000, participationFee: 100, emdAmount: 5000,
    startDate: start, endDate: end, status: "live"
  }});
  log("create auction", r);
  results.push(["create_auction", r.status]);
  const auction = r.data;
  if (!auction) { out("ABORT: no auction"); process.exit(0); }
  out("Auction id: " + auction._id);

  // Submit + verify participation fee, then EMD
  r = await api("/api/payments", { method: "POST", token, body: {
    auctionId: auction._id, type: "participation_fee", amount: 100, utr: "UTRFEE" + stamp, method: "upi",
    paymentDate: new Date().toISOString().slice(0, 10)
  }});
  log("submit participation fee", r);
  results.push(["submit_fee", r.status]);
  const feeSub = r.data && r.data.submission;

  r = await api("/api/payments", { method: "POST", token, body: {
    auctionId: auction._id, type: "emd", amount: 5000, utr: "UTREMD" + stamp, method: "upi",
    paymentDate: new Date().toISOString().slice(0, 10)
  }});
  log("submit EMD", r);
  results.push(["submit_emd", r.status]);
  const emdSub = r.data && r.data.submission;

  if (feeSub && feeSub._id) {
    r = await api(`/api/admin/payments/${feeSub._id}`, { method: "POST", token, body: { action: "verify" } });
    log("verify fee", r);
    results.push(["verify_fee", r.status]);
  } else { out("[FAIL] no fee sub"); results.push(["verify_fee", 500]); }

  if (emdSub && emdSub._id) {
    r = await api(`/api/admin/payments/${emdSub._id}`, { method: "POST", token, body: { action: "verify" } });
    log("verify emd", r);
    results.push(["verify_emd", r.status]);
  } else { out("[FAIL] no emd sub"); results.push(["verify_emd", 500]); }

  // Now user is eligible -> place bid
  r = await api("/api/bids", { method: "POST", token, body: { auctionId: auction._id, amount: 55000 } });
  log("place bid", r);
  results.push(["place_bid", r.status]);
  const winningAmount = 55000;

  // Simulate auction close (auction-closer worker marks winner + ended + release EMD)
  await closeAuctionForFixture(auction._id, mongoUser._id);

  r = await api(`/api/auctions/${auction._id}`, { token });
  log("auction detail after close", r);
  results.push(["auction_detail_after_close", r.status]);

  r = await api("/api/admin/payments", { token });
  log("admin payments list", r);
  results.push(["admin_payments_list", r.status]);

  r = await api("/api/admin/users", { token });
  log("admin users list", r);
  results.push(["admin_users", r.status]);

  r = await api("/api/admin/audit", { token });
  log("admin audit", r);
  results.push(["admin_audit", r.status]);

  // Create an address for the order, then create order
  r = await api("/api/users/addresses", { method: "POST", token, body: {
    name: "Test User", mobile, addressLine1: "12 MG Road", city: "Bengaluru",
    state: "Karnataka", pin: "560001", isDefault: true
  }});
  log("create address", r);
  results.push(["create_address", r.status]);
  const addr = r.data && (r.data.address || r.data);
  const addressId = addr && (addr._id || addr.id);

  // Balance payment (winningAmount - emdAdjusted = 55000 - 5000) -> verify -> create order
  const balanceDue = winningAmount - 5000;
  r = await api("/api/payments", { method: "POST", token, body: {
    auctionId: auction._id, type: "balance", amount: balanceDue, utr: "UTR BAL " + stamp, method: "upi",
    paymentDate: new Date().toISOString().slice(0, 10)
  }});
  log("submit balance payment", r);
  results.push(["submit_balance", r.status]);
  const balSub = r.data && r.data.submission;

  if (balSub && balSub._id) {
    r = await api(`/api/admin/payments/${balSub._id}`, { method: "POST", token, body: { action: "verify" } });
    log("verify balance", r);
    results.push(["verify_balance", r.status]);
  } else { out("[FAIL] no balance sub"); results.push(["verify_balance", 500]); }

  r = await api("/api/orders", { method: "POST", token, body: { auctionId: auction._id, addressId, balancePaymentId: balSub && (balSub.paymentId || balSub._id) } });
  log("create order", r);
  results.push(["create_order", r.status]);

  // Refunds list for user
  r = await api("/api/refunds", { token });
  log("user refunds list", r);
  results.push(["refunds_list", r.status]);

  out("\n========== SUMMARY ==========");
  results.forEach(([name, s]) => out(`  ${s >= 200 && s < 300 ? "PASS" : "FAIL"}  ${name}`));
  const pass = results.filter(([, s]) => s >= 200 && s < 300).length;
  out(`${pass}/${results.length} steps passed`);
  process.exit(0);
})().catch((e) => { out("SCRIPT ERROR: " + (e.stack || e.message)); process.exit(1); });

async function dbConnectForFixture(email) {
  const mongoose = require("mongoose");
  await mongoose.connect("mongodb://127.0.0.1:27017/auction_platform");
  const User = mongoose.model("User", new mongoose.Schema({ email: String, role: String, status: String }, { strict: false }));
  const u = await User.findOne({ email });
  if (u) { u.role = "super_admin"; u.status = "active"; await u.save(); }
  return u || {};
}

async function closeAuctionForFixture(auctionId, userId) {
  const { MongoClient, ObjectId } = require("mongodb");
  const c = new MongoClient("mongodb://127.0.0.1:27017/auction_platform");
  await c.connect();
  const db = c.db("auction_platform");
  const auctions = db.collection("auctions");
  const res = await auctions.updateOne(
    { _id: new ObjectId(auctionId) },
    { $set: { status: "ended", winner: new ObjectId(userId), currentHighestBidder: new ObjectId(userId), endDate: new Date(Date.now() - 1000) } }
  );
  const au = await auctions.findOne({ _id: new ObjectId(auctionId) });
  out("Auction closed (fixture): modified=" + res.modifiedCount + " winner=" + String(au && au.winner) + " amount=" + (au && au.currentBidAmount));
  await db.collection("emdledgers").insertOne({ userId: new ObjectId(userId), auctionId: new ObjectId(auctionId), type: "locked", amount: 5000, notes: "EMD locked for auction (fixture)", createdAt: new Date() });
  out("EMD locked record created (fixture)");
  await c.close();
}
