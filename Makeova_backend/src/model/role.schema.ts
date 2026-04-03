import mongoose, { Document, Types, Schema } from "mongoose";

interface IModuleAccess {
  module: string;
  permission: Types.ObjectId[];
}

export interface Irole extends Document {
  name: string;
  moduleAccess: IModuleAccess[];
  canAssignRoles:Types.ObjectId[];
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

const moduleAccessSchema = new Schema({
  module: { type: String, required: true },
  permission: [
    { type: Schema.Types.ObjectId, ref: "permission", required: true }
  ],
});

const roleSchema = new mongoose.Schema<Irole>(
  {
    name: { type: String, required: true },

    moduleAccess: [moduleAccessSchema],

    canAssignRoles: [
  {
    type: Schema.Types.ObjectId,
    ref: "role"
  }
],

    description: { type: String, required: true },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Role = mongoose.model<Irole>("role", roleSchema);

export default Role;