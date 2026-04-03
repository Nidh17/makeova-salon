import mongoose, { Schema } from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenExpiry: {
      type: Date,
      required: true,
    },

    refreshTokenExpiry: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const session = mongoose.model("session", sessionSchema);
export default session;
