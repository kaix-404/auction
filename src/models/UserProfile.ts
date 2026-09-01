export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    avatar: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
  },
  {
    timestamps: true,
  }
);

UserProfileSchema.index({ userId: 1 }, { unique: true });

const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile ||
  mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);

export default UserProfile;
