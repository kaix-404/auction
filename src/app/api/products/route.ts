import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import InventoryItem from "@/models/InventoryItem";
import { requireAdmin } from "@/lib/rbac";
import { getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const query: Record<string, unknown> = {};
    if (search) query.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List products error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "products")();
    if ("error" in guard) return guard.error;

    const body = await request.json();
    const { title, categoryId, brand, model, condition, costPrice, images, warranty, description, specifications } = body;

    if (!title || !costPrice) {
      return NextResponse.json({ error: "title and costPrice are required" }, { status: 400 });
    }

    const product = await Product.create({
      sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title,
      categoryId,
      brand,
      model,
      condition,
      costPrice,
      images: images || [],
      warranty,
      description,
      specifications,
      isActive: true,
    });

    const inventoryItem = await InventoryItem.create({
      productId: product._id,
      status: "available",
      notes: "Created with product",
    });

    await writeAuditLog({
      eventType: "product.create",
      actorId: guard.context.userId,
      actorRole: guard.context.role,
      action: "create_product",
      entityType: "product",
      entityId: product._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { title, sku: product.sku },
      reason: "Product created by admin",
    });

    return NextResponse.json({ product, inventoryItem }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
