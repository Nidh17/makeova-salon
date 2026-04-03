
import { IPaginationQuery } from "./pagination.interface.js";

export interface ICreatePermission {
  name: string;
  description?: string; 
}


export interface IUpdatePermission {
  name?: string;
  description?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface IPermissionPaginationQuery extends IPaginationQuery {}
