export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShippingAddress extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  state: string;
  pin: string;
  landmark: string;
  deliveryInstructions: string;
  isDefault: boolean;
  isSnapshot: boolean;
  snapshotOrderId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    locality: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    deliveryInstructions: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isSnapshot: {
      type: Boolean,
      default: false,
    },
    snapshotOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
);

ShippingAddressSchema.index({ userId: 1 });
ShippingAddressSchema.index({ userId: 1, isDefault: 1 });

const ShippingAddress: Model<IShippingAddress> =
  mongoose.models.ShippingAddress ||
  mongoose.model<IShippingAddress>("ShippingAddress", ShippingAddressSchema);

export default ShippingAddress;
