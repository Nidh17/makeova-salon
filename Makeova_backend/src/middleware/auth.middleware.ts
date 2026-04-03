import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel, { IUser } from "../model/user.schema.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import session from "../model/session.schema.js"; 

export interface AuthRequest extends Request {
  user?: IUser;
}

class AuthMiddleware {
  public async Vaildatetoken(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw AppError.unauthorized("Token not provided");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw AppError.unauthorized("Token is missing");
      }

      const decoded = jwt.verify(token, config.ACCESS_SECRET_KEY) as JwtPayload;
      const user = await userModel.findById(decoded.userId).populate("role");

      if (!user) {
        throw AppError.unauthorized("User not found");
      }

    
      const sessionDB = await session.findOne({ accessToken: token });
      if (!sessionDB) {
        throw AppError.unauthorized("Session not found, please login again");
      }

   
      if (sessionDB.accessTokenExpiry < new Date()) {
        throw AppError.unauthorized("Access token expired, please refresh");
      }

      req.user = user;
      logger.info(`Authenticated user: ${user.email}`);
      next();
    } catch (err: any) {
      logger.error(err.message);
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}

export default new AuthMiddleware();
