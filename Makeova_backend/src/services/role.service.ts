import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import roleFactory from "../factories/role.factory.js";
import {
  ICreateRole,
  IRolePaginationQuery,
  IUpdateRole,
} from "../interface/role.interface.js";

class RoleService {

    public async createRole(data: ICreateRole) {
        try {
            if (!data.name || !data.description) {
                throw AppError.badRequest("All fields are required")
            }

            return await roleFactory.createRole(data)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getallrole(query: IRolePaginationQuery) {
        try {
            return await roleFactory.getallrole(query)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getRolebyId(id: string) {
        try {
            if (!id) {
                throw AppError.badRequest("ID is required")
            }

            return await roleFactory.getRolebyId(id)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async updateRolebyId(id: string, data?: IUpdateRole) {
        try {
            if (!id) {
                throw AppError.badRequest("ID is required")
            }
            if (!data) {
                throw AppError.badRequest("Please provide update data")
            }

            return await roleFactory.updateRolebyId(id, data)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async deleteRole(id: string) {
        try {
            if (!id) {
                throw AppError.badRequest("Invalid id")
            }

            return await roleFactory.deleteRole(id)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }
}

export default new RoleService();
