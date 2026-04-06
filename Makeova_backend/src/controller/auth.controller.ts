import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import authService from "../services/auth.service.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { IUserLogin } from "../interface/user.interface.js";
import { IRefreshTokenRequest } from "../interface/auth.interface.js";

class AuthController {
    private extractBearerToken(authorizationHeader?: string) {
        if (!authorizationHeader?.startsWith("Bearer ")) {
            return undefined;
        }

        return authorizationHeader.slice(7).trim() || undefined;
    }

    public async Userlogin(req: Request, res: Response) {
        try {
            const result = await authService.Userlogin(req.body as IUserLogin)

            res.cookie("refreshToken", result.data.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            logger.error(err.message)
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }


    public async getMe(req: Request, res: Response) {
  try {
    // authMiddleware.Vaildatetoken attaches decoded userId to req
    const userId = (req as any).userId
 
    const result = await authService.getMe(userId)
    ResponseHandler.handleResponse(res, result)
 
  } catch (err: any) {
    const errorResponse = await ResponseHandler.handleError(err)
    ResponseHandler.handleResponse(res, errorResponse)
  }
}
 

    public async refreshToken(req: Request, res: Response) {
        try {
            const token =
                req.cookies.refreshToken ||
                (req.body as Partial<IRefreshTokenRequest>)?.refreshToken
            const result = await authService.refreshtoken(token)

           
            res.cookie("refreshToken", result.data.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            logger.error(err.message)
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }
   
    public async logout(req: Request, res: Response) {
        try {
            const token =
                req.cookies.refreshToken ||
                (req.body as Partial<IRefreshTokenRequest>)?.refreshToken ||
                (req.body as { refresh_token?: string })?.refresh_token ||
                (req.body as { token?: string })?.token ||
                this.extractBearerToken(req.headers.authorization)
            const result = await authService.logout(token)

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
            });

            ResponseHandler.handleResponse(res, result)

        } catch (err: any) {
            logger.error(err.message)
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    }
}

export default new AuthController();
