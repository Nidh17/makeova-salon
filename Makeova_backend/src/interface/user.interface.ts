import { Types } from "mongoose";
import { IPaginationQuery } from "./pagination.interface.js";


export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  phonenumber: string;
  gender: "male" | "female" | "other";
  address: string;
  role: Types.ObjectId[] | string[]; 
  profileImg?: string;
  dob?: string;
  specialization?: Types.ObjectId | string;
  experienceYears?: number;
  isAvailable?: boolean;
  Bio?: string;
  WorkingDay?: (
    | "sun"
    | "mon"
    | "tue"
    | "wed"
    | "thu"
    | "fri"
    | "sat"
  )[];
  createdBy?: Types.ObjectId | string;
}


export interface IUpdateUser {
  name?: string;
  email?: string;
  password?: string;
  phonenumber?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  role: Types.ObjectId[] | string[]; 
  profileImg?: string;
  dob?: string;
  
  specialization?: Types.ObjectId | string;
  experienceYears?: number;
  isAvailable?: boolean;
  Bio?: string;
  WorkingDay?: (
    | "sun"
    | "mon"
    | "tue"
    | "wed"
    | "thu"
    | "fri"
    | "sat"
  )[];
  createdBy?:Types.ObjectId | string
}


export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserPaginationQuery extends IPaginationQuery {}
