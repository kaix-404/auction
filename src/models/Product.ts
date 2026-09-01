export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  sku: string;
  title: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  subcategoryId?: mongoose.Types.ObjectId;
  brand?: string;
  specifications?: Map<string, string>;
  condition: string;
  images: string[];
  videoUrl?: string;
  warranty?: string;
  costPrice: number;
  marketPrice?: number;
  serialNumber?: string;
  serialNumberAccess: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: function () {
        return `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: String,
      trim: true,
    },
    specifications: {
      type: Map,
      of: String,
    },
    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair", "poor"],
    },
    images: [
      {
        type: String,
      },
    ],
    videoUrl: {
      type: String,
    },
    warranty: {
      type: String,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    marketPrice: {
      type: Number,
      min: 0,
    },
    serialNumber: {
      type: String,
      select: false,
    },
    serialNumberAccess: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.add({
  model: {
    type: String,
    trim: true,
  },
} as any);

ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ isActive: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
