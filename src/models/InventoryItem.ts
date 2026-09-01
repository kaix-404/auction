export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { InventoryStatus } from "@/types";

export interface IInventoryItem extends Document {
  productId: mongoose.Types.ObjectId;
  status: InventoryStatus;
  auctionId?: mongoose.Types.ObjectId;
  currentOrderId?: mongoose.Types.ObjectId;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "scheduled", "live", "sold", "reserved", "shipped", "delivered", "returned", "reauction"],
      default: "available",
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

InventoryItemSchema.index({ productId: 1 });
InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ auctionId: 1 });
InventoryItemSchema.index({ status: 1, auctionId: 1 });

const InventoryItem: Model<IInventoryItem> =
  mongoose.models.InventoryItem ||
  mongoose.model<IInventoryItem>("InventoryItem", InventoryItemSchema);

export default InventoryItem;
