import { NextFunction, Response, RequestHandler } from "express";
import { logger } from "../utils/logger.js";
import { AuthRequest } from "./auth.middleware.js";
import { METHOD_ACTION_MAP } from "../constant/permission.js";
import userModel from "../model/user.schema.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";

class PermissionMiddleware {
  public checkPermission(moduleName: string): RequestHandler {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const user: any = req.user;
        if (!user) {
          throw AppError.unauthorized("Unauthorized user");
        }

        if (user?.role[0]?.name === "admin") {
          return next();
        }

        const action =
          METHOD_ACTION_MAP[req.method as keyof typeof METHOD_ACTION_MAP];
        logger.info(
          `Checking permission → module: ${moduleName}, action: ${action}`,
        );

        const dbUser = await userModel.findById(user._id).populate({
          path: "role",
          populate: {
            path: "moduleAccess.permission",
          },
        });

        if (!dbUser) {
          throw AppError.unauthorized("User not found");
        }

        const roles = dbUser.role as any[];
        let allowed = false;

        for (const role of roles) {
          const modulePermission = role.moduleAccess?.find(
            (m: any) => m.module === moduleName,
          );

          logger.info(`modulePermission: ${JSON.stringify(modulePermission)}`);

          if (!modulePermission) continue;

          const hasPermission = modulePermission.permission?.some(
            (p: any) => p.name === action,
          );

          if (hasPermission) {
            allowed = true;
            break;
          }
        }

        if (!allowed) {
          throw AppError.forbidden("Access denied");
        }

        return next();
      } catch (err: any) {
        logger.error(err.message);
        const errorResponse = await ResponseHandler.handleError(err);
        ResponseHandler.handleResponse(res, errorResponse);
      }
    };
  }
}

export default new PermissionMiddleware();
