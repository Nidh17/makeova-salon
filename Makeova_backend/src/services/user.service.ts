import userFactory from "../factories/user.factory.js";
import { logger } from "../utils/logger.js";
import authHelper from "../helper/auth/auth.helper.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/AppError.js";
import {
  ICreateUser,
  IUpdateUser,
  IUserPaginationQuery,
} from "../interface/user.interface.js";

class UserService {
  public async createUser(data: ICreateUser, req: AuthRequest) {
    try {
      if (!data.password || !data.email || !data.password || !data.name) {
        throw AppError.badRequest("fill required Filled");
      }

      const hashedPassword = await authHelper.hashpassword(data.password);

      const userData: ICreateUser = {
    ...data,
    password: hashedPassword
};
      logger.info("service user info" + data);

      const newUser = await userFactory.createUser(userData, req);

      return newUser;
    } catch (err: any) {
      logger.error("service " + err.message);

      throw Error(err.message);
    }
  }

  public async getAllUsers(query: IUserPaginationQuery) {
    return await userFactory.getAllUsers(query);
  }

  public async getUserById(id: string) {
    if (!id) {
      throw AppError.notFound("User id required");
    }

    return await userFactory.getUserById(id);
  }

  public async updateUser(id: string, data: IUpdateUser) {
    if (!id) {
      throw AppError.notFound("User id required");
    }

   let updateuser= await userFactory.updateUser(id, data);
   return updateuser
  }

  public async deleteUser(id: string) {
    if (!id) {
      throw AppError.notFound("User id required");
    }

    return await userFactory.deleteUser(id);
  }
}

export default new UserService();
