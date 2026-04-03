import serviceFactory from "../factories/service.factory.js";
import {
  IServicePaginationQuery,
  IUpdateService,
} from "../interface/service.interface.js";
import { Iservice } from "../model/services.schema.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

class ServiceService {
  public async createService(payload: Iservice) {
    try {
      const { name, description, price, duration} = payload;

      if (!name || !description || !price || !duration ) {
        throw AppError.badRequest("Please fill all required fields");
      }

      return await serviceFactory.createService(payload);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async updateService(id: string, updatedata: IUpdateService) {
    try {
      if (!id) throw AppError.badRequest("Id is required");
      if (!updatedata) throw AppError.badRequest("Update data required");

      return await serviceFactory.updateService(id, updatedata);
    } catch (err: any) {
      throw err;
    }
  }

  public async getAllServices(query: IServicePaginationQuery) {
    try {
      return await serviceFactory.getAllServices(query);
    } catch (err: any) {
      throw err;
    }
  }

  public async getServiceById(id: string) {
    try {
      if (!id) throw AppError.badRequest("Id is required");

      return await serviceFactory.getServiceById(id);
    } catch (err: any) {
      throw err;
    }
  }

  public async deleteService(id: string) {
    try {
      if (!id) throw AppError.badRequest("Id is required");

      return await serviceFactory.deleteService(id);
    } catch (err: any) {
      throw err;
    }
  }
}

export default new ServiceService();
