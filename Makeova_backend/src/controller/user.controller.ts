import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import userService from "../services/user.service.js";
import Role from "../model/role.schema.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import {
  ICreateUser,
  IUpdateUser,
  IUserPaginationQuery,
} from "../interface/user.interface.js";

class UserController {

    public async createUser(req: AuthRequest, res: Response) {
        try {
            let payload=req.body as ICreateUser
            const authUser = (req as unknown as AuthRequest).user;

            const currentRole = await Role.findById(authUser?.role[0]);
            const assignedRole = await Role.findById(req.body.role);

            
            if (assignedRole?.name === "Admin" && currentRole?.name !== "Admin") {
                throw AppError.forbidden("You cannot create admin user")
            }

            const result = await userService.createUser(payload, req);
            ResponseHandler.handleResponse(res, result);

        } catch (err: any) {
            logger.error(err.message);
           
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    public async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUsers(
                req.query as unknown as IUserPaginationQuery
            );
            ResponseHandler.handleResponse(res, users);

        } catch (err: any) {
        
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    public async getUserById(req: Request, res: Response) {
        try {
            const user = await userService.getUserById(req.params.id as string);
            ResponseHandler.handleResponse(res, user);

        } catch (err: any) {
          
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    public async updateUser(req: Request, res: Response) {
        try {
            const user = await userService.updateUser(req.params.id as string, req.body as IUpdateUser);
            ResponseHandler.handleResponse(res, user);

        } catch (err: any) {
         
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    public async deleteUser(req: Request, res: Response) {
        try {
            const user = await userService.deleteUser(req.params.id as string);
            ResponseHandler.handleResponse(res, user);

        } catch (err: any) {
            
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }
}

export default new UserController();
