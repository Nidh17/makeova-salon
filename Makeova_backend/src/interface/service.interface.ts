
import { IPaginationQuery } from "./pagination.interface.js";

export interface ICreateService {
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  isActive?: boolean; 
}


export interface IUpdateService {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  image?: string;
  isActive?: boolean;
}

export interface IServicePaginationQuery extends IPaginationQuery {}
