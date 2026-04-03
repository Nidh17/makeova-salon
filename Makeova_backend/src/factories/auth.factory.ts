import { logger } from "../utils/logger.js";
import user from "../model/user.schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import session from "../model/session.schema.js";
import { config } from "../config/config.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { Responsecodes } from "../enum/resposne.code.js";
import { IJwtDecoded, ITokenPayload, IUserLogin } from "../interface/auth.interface.js";

class AuthFactory {

    public async Userlogin(userlogin: IUserLogin) {
        try {
            //ache variable name rkho na
            const u = await user.findOne({ email: userlogin.email }).populate('role');
            if (!u) {
                throw AppError.notFound("User does not exist with this email")
            }

            const isMatch = await bcrypt.compare(userlogin.password, u.password);
            if (!isMatch) {
                throw AppError.badRequest("Invalid password")
            }

            const accessToken = jwt.sign(
                { userId: u.id },
                config.ACCESS_SECRET_KEY,
                { expiresIn: "15m" } /// should be from constants 
            );

            const refreshToken = jwt.sign(
                { userId: u.id },
                config.REFRESH_SCCRET_KEY,
                { expiresIn: "7d" }
            );

            await session.findOneAndUpdate(
                { userId: u._id },
                {
                    accessToken,
                    refreshToken,
                    accessTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
                    refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                { upsert: true, new: true }


                //upsert vs insert vs update.
            );

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "User logged in successfully",
                { u, accessToken, refreshToken }
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    // ═══════════════════════════════════════════════════════════
// ADD TO: factory/auth.factory.ts
// Add this method inside your AuthFactory class
// ═══════════════════════════════════════════════════════════

public async getMe(userId: string) {
  try {
    const u = await user
      .findById(userId)
      .select('-password')        // never expose password
      .populate({
        path: 'role',
        populate: {
          path: 'moduleAccess.permission'  
        }
      })
      .populate('specialization')

    if (!u) {
      throw AppError.notFound('User not found')
    }

    return await ResponseHandler.sendResponse(
      Responsecodes.OK,
      'User fetched successfully',
      { u }
    )
  } catch (err: any) {
    logger.error(err.message)
    throw err
  }
}

    public async refreshtoken(t: string ) {
        try {
            if (!t) {
                throw AppError.badRequest("Token is required")
            }

            const tokenDB = await session.findOne({ refreshToken: t });
            if (!tokenDB) {
                throw AppError.notFound("No session found for this token")
            }

            if (tokenDB.refreshTokenExpiry < new Date()) {
                await session.deleteOne({ refreshToken: t });
                throw AppError.unauthorized("Refresh token expired, please login again")
            }

            const decode: any = jwt.verify(t , config.REFRESH_SCCRET_KEY) as IJwtDecoded;

            const newAccessToken = jwt.sign(
                { userId: decode.userId },
                config.ACCESS_SECRET_KEY,
                { expiresIn: "15m" }
            );

            const newRefreshToken = jwt.sign(
                { userId: decode.userId },
                config.REFRESH_SCCRET_KEY,
                { expiresIn: "7d" }
            );

           
            tokenDB.accessToken = newAccessToken;
            tokenDB.refreshToken = newRefreshToken;
            tokenDB.accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
            tokenDB.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await tokenDB.save();

           
            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Tokens refreshed successfully",
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                }
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async logout(token: any) {
        try {
            if (!token) {
                throw AppError.badRequest("Token is required")
            }

            const tokenDB = await session.findOne({ refreshToken: token });
            if (!tokenDB) {
                throw AppError.notFound("No session found for this token")
            }

            await session.deleteOne({ refreshToken: token });

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "User logged out successfully",
                null
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }
}

export default new AuthFactory();
