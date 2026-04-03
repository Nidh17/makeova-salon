import mongoose from "mongoose";

interface Ipermission extends Document {
  name: string;
  description: string;
  isDeleted:Boolean;
  createdAt:Date;
  updateAt:Date
  deletedAt:Date
}

const permissionSchema = new mongoose.Schema<Ipermission>(
  {
    name: {
      type: String,
      required: [true, "permission name is required"],
      unique: true,
    },
    description: {
      type: String,
    },
    isDeleted:{type:Boolean,default:false}
  },
  { timestamps: true },
);

let permission = mongoose.model<Ipermission>("permission", permissionSchema);


export default permission