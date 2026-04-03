import { Responsecodes } from "../enum/resposne.code.js";
import {
  IServicePaginationQuery,
  IUpdateService,
} from "../interface/service.interface.js";
import service, { Iservice } from "../model/services.schema.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import paginationHelper from "../helper/pagination.helper.js";

class ServiceFactory {
  public async createService(serviceinfo: Iservice) {
    try {
      const isAvailable = await service.findOne({ name: serviceinfo.name });

      if (isAvailable) {
        throw AppError.conflict("Service already exists");
      }

      const newService = await service.create(serviceinfo);

      return await ResponseHandler.sendResponse(
        Responsecodes.CREATED,
        "Service created successfully",
        newService,
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async updateService(id: string, updatedata: IUpdateService) {
    try {
      const updated = await service.findByIdAndUpdate(id, updatedata, {
        new: true,
      });

      if (!updated) {
        throw AppError.notFound("Service not found");
      }

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "Service updated successfully",
        updated,
      );
    } catch (err: any) {
      throw err;
    }
  }

  public async getAllServices(query: IServicePaginationQuery) {
    try {
      const { page, limit, skip } = paginationHelper.parsePagination(query);
      const search =
        typeof query.search === "string" ? query.search.trim() : "";
      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const [services, totalItems] = await Promise.all([
        service.find(filter).skip(skip).limit(limit).sort({ _id: -1 }),
        service.countDocuments(filter),
      ]);

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "All services",
        {
          items: services,
          pagination: paginationHelper.buildMeta(totalItems, page, limit),
        },
      );
    } catch (err: any) {
      throw err;
    }
  }

  public async getServiceById(id: string) {
    try {
      const result = await service.findById(id);

      if (!result) {
        throw AppError.notFound("Service not found");
      }

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "Service found successfully",
        result,
      );
    } catch (err: any) {
      throw err;
    }
  }

  public async deleteService(id: string) {
    try {
      const result = await service.findByIdAndDelete(id);

      if (!result) {
        throw AppError.notFound("Service not found");
      }

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "Service deleted successfully",
        result,
      );
    } catch (err: any) {
      throw err;
    }
  }
}

export default new ServiceFactory();
