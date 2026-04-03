import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import roleService from "../services/role.service.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import {
  ICreateRole,
  IRolePaginationQuery,
  IUpdateRole,
} from "../interface/role.interface.js";

class RoleController {

    public async createRole(req: Request, res: Response) {
        try {
            const result = await roleService.createRole(req.body as ICreateRole)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            logger.error(err.message)
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async getallrole(req: Request, res: Response) {
        try {
            const result = await roleService.getallrole(
                req.query as unknown as IRolePaginationQuery
            )
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async getRolebyId(req: Request, res: Response) {
        try {
            const result = await roleService.getRolebyId(req.params.id as string)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async updateRolebyId(req: Request, res: Response) {
        try {
            const result = await roleService.updateRolebyId(req.params.id as string, req.body as IUpdateRole)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }

    public async deleteRole(req: Request, res: Response) {
        try {
            const result = await roleService.deleteRole(req.params.id as string)
            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }
}

export default new RoleController();
