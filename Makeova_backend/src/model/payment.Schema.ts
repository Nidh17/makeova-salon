import mongoose, { Schema, Document, Types } from "mongoose";

export interface Ipayment extends Document {
  userid: Types.ObjectId;
  appointmentid: Types.ObjectId;
  receptionistId: Types.ObjectId;
  paymentMode: "cash" | "online" | "card";
  transactionId: string;
  amount: number;
  paymentstatus: "pending" | "done" | "failed";
  paidAt?: Date;
  timestamps?: boolean;
}

const PaymentSchema = new mongoose.Schema<Ipayment>({
  userid: { type: Schema.Types.ObjectId, ref: "user", required: true },
  appointmentid: {
    type: Schema.Types.ObjectId,
    ref: "appointment",
    required: true,
  },
  receptionistId: { type: Schema.Types.ObjectId, ref: "user" },
  paymentMode: {
    type: String,
    enum: ["cash", "online", "card"],
    required: true,
  },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentstatus: { type: String, enum: ["pending", "done", "failed"] },
  paidAt: { type: Date, default: Date.now },
  timestamps: { type: Boolean, default: true },
});

module.exports = mongoose.model<Ipayment>("payment", PaymentSchema);
