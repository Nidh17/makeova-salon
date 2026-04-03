import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import permissionFactory from "../factories/permission.factory.js";
import {
  ICreatePermission,
  IPermissionPaginationQuery,
  IUpdatePermission,
} from "../interface/permission.interface.js";

class PermissionService {

    public async createPermission(data: ICreatePermission) {
        try {
            if (!data.name) {
                throw AppError.badRequest("Permission name is required")
            }

            return await permissionFactory.createPermission(data)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getallPermission(query: IPermissionPaginationQuery) {
        try {
            return await permissionFactory.getallPermission(query)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getPermissionByid(id: string) {
        try {
            if (!id) {
                throw AppError.badRequest("Id is required")
            }

            return await permissionFactory.getPermissionByid(id)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async updatePermission(id: string, data: IUpdatePermission) {
        try {
            if (!id) {
                throw AppError.badRequest("Id is required")
            }
            if (!data.name) {
                throw AppError.badRequest("Please provide update data")
            }

            return await permissionFactory.updatePermission(id, data)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async deletePermission(id: string) {
        try {
            if (!id) {
                throw AppError.badRequest("Permission id is required")
            }

            return await permissionFactory.deletePermission(id)

        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }
}

export default new PermissionService();
