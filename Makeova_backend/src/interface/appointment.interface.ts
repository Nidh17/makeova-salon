import { Types } from "mongoose";
import { IPaginationQuery } from "./pagination.interface.js";


export interface ICreateAppointment {
  userID: Types.ObjectId | string;
  staffID: Types.ObjectId | string;
  receptionistId: Types.ObjectId | string;
  services: Types.ObjectId | string;
  appointmentDate: Date;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status?: "done" | "pending" | "failed" | "processing";
  note?: string;
}
export interface IUpdateAppointment {
  userID?: Types.ObjectId | string;
  staffID?: Types.ObjectId | string;
  receptionistId?: Types.ObjectId | string;
  services?: Types.ObjectId | string;
  appointmentDate?: Date;
  startTime?: Date;
  endTime?: Date;
  totalPrice?: number;
  status?: "done" | "pending" | "failed" | "processing";
  note?: string;
}

export interface IAppointmentPaginationQuery extends IPaginationQuery {}
