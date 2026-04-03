import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import PermissionService from "../services/Permission.service.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import {
  ICreatePermission,
  IPermissionPaginationQuery,
  IUpdatePermission,
} from "../interface/permission.interface.js";

class PermissionController {

    public async createPermission(req: Request, res: Response) {
        try {
            const result = await PermissionService.createPermission(req.body as ICreatePermission)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            logger.error(err.message)
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async getallPermission(req: Request, res: Response) {
        try {
            const result = await PermissionService.getallPermission(
                req.query as unknown as IPermissionPaginationQuery
            )
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async getPermissionByid(req: Request, res: Response) {
        try {
            const result = await PermissionService.getPermissionByid(req.params.id as string)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async updatePermission(req: Request, res: Response) {
        try {
            const result = await PermissionService.updatePermission(req.params.id as string, req.body as IUpdatePermission)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async deletePermission(req: Request, res: Response) {
        try {
            const result = await PermissionService.deletePermission(req.params.id as string)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }
}

export default new PermissionController();
