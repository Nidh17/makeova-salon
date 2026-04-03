import { Types } from "mongoose";
import { IPaginationQuery } from "./pagination.interface.js";


export interface IModuleAccess {
  module: string;
  permission: Types.ObjectId[] | string[];
}

export interface ICreateRole {
  name: string;
  description: string;
  moduleAccess?: IModuleAccess[];
  canAssignRoles?: Types.ObjectId[] | string[];
}

export interface IUpdateRole {
  name?: string;
  description?: string;
  moduleAccess?: IModuleAccess[];
  canAssignRoles?: Types.ObjectId[] | string[];
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface IRolePaginationQuery extends IPaginationQuery {}
