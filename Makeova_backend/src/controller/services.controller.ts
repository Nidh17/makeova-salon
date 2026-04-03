import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import servicesServices from "../services/services.services.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { Iservice } from "../model/services.schema.js";
import {
  IServicePaginationQuery,
  IUpdateService,
} from "../interface/service.interface.js";

class ServiceController {
  public async createService(req: Request, res: Response) {
    try {
      const payload = req.body as Iservice;

      const result = await servicesServices.createService(payload);

      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      logger.error(err.message);

      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async updateService(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updatedata = req.body as IUpdateService;

      const result = await servicesServices.updateService(id, updatedata);

      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      logger.error(err.message);

      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getallServices(req: Request, res: Response) {
    try {
      const result = await servicesServices.getAllServices(
        req.query as unknown as IServicePaginationQuery,
      );

      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getserviceByid(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const result = await servicesServices.getServiceById(id);

      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async deleteByid(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const result = await servicesServices.deleteService(id);

      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}

export default new ServiceController();
