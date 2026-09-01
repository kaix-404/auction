export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShipment extends Document {
  orderId: mongoose.Types.ObjectId;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  status:
    | "pending"
    | "label_created"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  estimatedDelivery: Date;
  actualDelivery: Date;
  shippedBy: mongoose.Types.ObjectId;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    carrier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "pending",
        "label_created",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
        "returned",
      ],
      default: "pending",
    },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    shippedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

ShipmentSchema.index({ orderId: 1 });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ trackingNumber: 1 });

const Shipment: Model<IShipment> =
  mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", ShipmentSchema);

export default Shipment;
