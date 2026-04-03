import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import authFactory from "../factories/auth.factory.js";
import { IUserLogin } from "../interface/auth.interface.js";

class AuthService {

    public async Userlogin(data: IUserLogin) {
        try {
            if (!data.email || !data.password) {
                throw AppError.badRequest("Email and password are required")
            }

            return await authFactory.Userlogin(data)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getMe(userId: string) {
  // Validate userId exists and is a valid MongoDB ObjectId
  if (!userId) {
    throw AppError.badRequest('User ID is required')
  }
 
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid user ID format')
  }
 
  return await authFactory.getMe(userId)
}

    public async refreshtoken(token: string) {
        try {
            if (!token) {
                throw AppError.badRequest("Token is required")
            }

            return await authFactory.refreshtoken(token )

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }
    public async logout(token?: string) {
    try {
        if (!token) {
            throw AppError.badRequest("Token is required")
        }

        return await authFactory.logout(token)

    } catch (err: any) {
        logger.error(err.message);
        throw err
    }
}
}
 
export default new AuthService();
