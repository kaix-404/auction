import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Auction from "@/models/Auction";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuthContext, getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "ending_soon";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    let sortQuery: Record<string, 1 | -1> = { endDate: 1 };
    if (sort === "ending_latest") sortQuery = { endDate: -1 };
    else if (sort === "price_low") sortQuery = { currentBidAmount: 1 };
    else if (sort === "price_high") sortQuery = { currentBidAmount: -1 };

    const skip = (page - 1) * limit;

    const [auctions, total] = await Promise.all([
      Auction.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate("productId", "title images brand model condition")
        .lean(),
      Auction.countDocuments(query),
    ]);

    const productIds = auctions
      .map((a) => a.productId)
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const result = await Promise.all(
      auctions.map(async (auction) => {
        let winnerInfo = null;
        if (auction.winner) {
          const u = await User.findById(auction.winner).select("email mobile").lean();
          winnerInfo = u ? { email: u.email, mobile: u.mobile } : null;
        }
        return {
          ...auction,
          product: productMap.get(String((auction as any).productId)) || null,
          winnerInfo,
        };
      })
    );

    return NextResponse.json({
      auctions: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List auctions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const context = await getAuthContext(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (context.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const required = [
      "productId",
      "title",
      "reservePrice",
      "bidIncrement",
      "participationFee",
      "emdAmount",
      "startDate",
      "endDate",
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    const adminUser = await User.findById(context.userId);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const auction = await Auction.create({
      ...body,
      status: body.status || "draft",
      createdBy: adminUser._id,
      currentBidAmount: 0,
      participantCount: 0,
      bidCount: 0,
      isFeatured: body.isFeatured || false,
    });

    await writeAuditLog({
      eventType: "auction.create",
      actorId: context.userId,
      actorRole: context.role,
      action: "create_auction",
      entityType: "auction",
      entityId: auction._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: {
        title: auction.title,
        reservePrice: auction.reservePrice,
        status: auction.status,
      },
      reason: "Auction created by admin",
    });

    if (auction.status === "live" || auction.status === "registration_open") {
      await scheduleAuctionClose(auction);
    }

    return NextResponse.json(auction, { status: 201 });
  } catch (err) {
    console.error("Create auction error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function scheduleAuctionClose(auction: {
  _id: unknown;
  endDate: Date;
}): Promise<void> {
  try {
    const { auctionCloseQueue } = await import("@/lib/queue");
    const endTime = new Date(auction.endDate).getTime();
    const delay = Math.max(endTime - Date.now(), 0);
    await auctionCloseQueue.add(
      "close-auction",
      { auctionId: String(auction._id) },
      { delay, jobId: `auction:${String(auction._id)}:close` }
    );
  } catch (err) {
    console.error("Failed to schedule auction close:", err);
  }
}
