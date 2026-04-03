import mongoose, { Schema, Types } from "mongoose"
 
export interface ILeave extends Document {
  staffId:    Types.ObjectId
  date:       Date
  reason?:    string
  type:       "full_day" | "half_day_morning" | "half_day_evening"
  status:     "pending" | "approved" | "rejected"
  approvedBy?: Types.ObjectId
  createdAt:  Date
}
 
const leaveSchema = new mongoose.Schema<ILeave>({
  staffId:    { type: Schema.Types.ObjectId, ref: "user", required: true },
  date:       { type: Date, required: true },
  reason:     { type: String },
  type:       { type: String, enum: ["full_day", "half_day_morning", "half_day_evening"], default: "full_day" },
  status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  approvedBy: { type: Schema.Types.ObjectId, ref: "user" },
}, { timestamps: true })
 
const Leave = mongoose.model<ILeave>("leave", leaveSchema)
export default Leave