import mongoose, { Document } from "mongoose";

export interface Iservice extends Document {
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
}

const serviceSchema = new mongoose.Schema<Iservice>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
});



const service = mongoose.model<Iservice>("service", serviceSchema);
export default service;
