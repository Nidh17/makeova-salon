import mongoose, { Schema, Types } from "mongoose";

export interface Iappointment extends Document {
  userID: Types.ObjectId;
  staffID: Types.ObjectId;
  receptionistId: Types.ObjectId;
  services: Types.ObjectId;
  appointmentDate: Date;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
 status:  "pending" | "confirmed" | "completed" | "cancelled";
  note?: string;
}

const AppointmentSchema = new mongoose.Schema<Iappointment>({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  staffID: {
    type: Schema.Types.ObjectId,
    ref: "user",
  required: true,
  },
  receptionistId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  services: {
    type: Schema.Types.ObjectId,
    ref: "service",
    required: true,
  },
  appointmentDate: { type: Date, default: Date.now, required: true },
  startTime: { type: Date, default: Date.now, required: true },
  endTime: { type: Date, default: Date.now, required: true },
  totalPrice: { type: Number, default: 0, required: true },
 status: { 
  type: String, 
  enum: ["pending", "confirmed", "completed", "cancelled"],
  default: "pending"
},
  note: { type: String },
});

const appointment = mongoose.model<Iappointment>("appointment", AppointmentSchema);
export default appointment


