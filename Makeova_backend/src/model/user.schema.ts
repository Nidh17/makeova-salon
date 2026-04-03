import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phonenumber: string;
  gender: "male" | "female" | "other";
  profileImg?: string;
  address: string;
  dob?: string;
  role: Types.ObjectId[];
  specialization?: Types.ObjectId;
  experienceYears?: number;
  isAvailable: boolean;
  Bio?: string;
  WorkingDay?: ("sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")[];
  createdAt: Date;
  createdBy?: Types.ObjectId;
  
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phonenumber: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  profileImg: { type: String },
  address: { type: String, required: true },
  dob: { type: String },
  role: [
    {
      type: Schema.Types.ObjectId,
      ref: "role",
      required: true,
    },
  ],
  specialization: {
    type: Schema.Types.ObjectId,
    ref: "service",
  }, 

  experienceYears: { type: Number },
  isAvailable: { type: Boolean, default: true },
  Bio: { type: String },
  WorkingDay: [
    {
      type: String,
      enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    },
  ],
  createdAt: { type: Date, default: Date.now() },
   createdBy: {
    type: Schema.Types.ObjectId,
    ref: "user"
  }
});
const userModel = mongoose.model<IUser>("user", userSchema);

export default userModel;


