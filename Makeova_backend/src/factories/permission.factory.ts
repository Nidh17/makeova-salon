import permission from "../model/permission.schema.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { Responsecodes } from "../enum/resposne.code.js";
import {
  ICreatePermission,
  IPermissionPaginationQuery,
  IUpdatePermission,
} from "../interface/permission.interface.js";
import paginationHelper from "../helper/pagination.helper.js";

class PermissionFactory {

    public async createPermission(permissions: ICreatePermission) {
        try {
            const isPermission = await permission.findOne({ name: permissions.name });
            if (isPermission) {
                throw AppError.conflict("Permission already exists")
            }

            const newPermission = await permission.create({
                name: permissions.name,
                description: permissions.description,
            });

            return await ResponseHandler.sendResponse(
                Responsecodes.CREATED,
                "Permission created successfully",
                newPermission
            )
        } catch (err: any) {
            logger.error(err.message);
             throw err
        } 
    }
    public async getallPermission(query: IPermissionPaginationQuery) {
        try {
            const { page, limit, skip } = paginationHelper.parsePagination(query);
            const search =
                typeof query.search === "string" ? query.search.trim() : "";
            const filter: Record<string, unknown> = { isDeleted: false };

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ];
            }

            const [permissions, totalItems] = await Promise.all([
                permission.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
                permission.countDocuments(filter),
            ]);

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "All permissions fetched successfully",
                {
                    items: permissions,
                    pagination: paginationHelper.buildMeta(totalItems, page, limit),
                }
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }


    public async getPermissionByid(id: string) {
        try {
            const p = await permission.findById(id);
            if (!p) {
                throw AppError.notFound("Permission not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Permission fetched successfully",
                p
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async updatePermission(id: string, data: IUpdatePermission) {
        try {
            const updated = await permission.findByIdAndUpdate(id, data, { new: true });
            if (!updated) {
                throw AppError.notFound("Permission not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Permission updated successfully",
                updated
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }
   
     public async deletePermission(id: string) {
        try {
            const deleted = await permission.findByIdAndUpdate(
                id,
                { isDeleted: true, deletedAt: new Date() },
                { returnDocument: "after" }
            )
            if (!deleted) {
                throw AppError.notFound("Permission not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Permission deleted successfully",
                deleted
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }

        
    }
}

export default new PermissionFactory();



