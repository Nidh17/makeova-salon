import Role from "../model/role.schema.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { Responsecodes } from "../enum/resposne.code.js";
import {
  ICreateRole,
  IRolePaginationQuery,
  IUpdateRole,
} from "../interface/role.interface.js";
import paginationHelper from "../helper/pagination.helper.js";

class RoleFactory {

    public async createRole(roleinfo: ICreateRole) {
        try {
            const existRole = await Role.findOne({ name: roleinfo.name })
            if (existRole) {
                throw AppError.conflict("This role already exists")
            }

            const newRole = await Role.create({
                name: roleinfo.name,
                moduleAccess: roleinfo.moduleAccess,
                canAssignRoles: roleinfo.canAssignRoles,
                description: roleinfo.description,
            });

            return await ResponseHandler.sendResponse(
                Responsecodes.CREATED,
                "Role created successfully",
                newRole
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err  
        }
    }

    public async getallrole(query: IRolePaginationQuery) {
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

            const [result, totalItems] = await Promise.all([
                Role.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
                Role.countDocuments(filter),
            ]);

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "All roles fetched successfully",
                {
                    items: result,
                    pagination: paginationHelper.buildMeta(totalItems, page, limit),
                }
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getRolebyId(id: string) {
        try {
            const data = await Role.findById(id);
            if (!data) {
                throw AppError.notFound("Role not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Role fetched successfully",
                data
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async updateRolebyId(id: string, data: IUpdateRole) {
        try {
            const updatedRole = await Role.findByIdAndUpdate(
                id,
                data,
                { returnDocument: "after" }
            );

            if (!updatedRole) {
                throw AppError.notFound("Role not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Role updated successfully",
                updatedRole
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async deleteRole(id: string) {
        try {
            const role = await Role.findByIdAndUpdate(
                id,
                { isDeleted: true, deletedAt: new Date() },
                { returnDocument: "after" }
            );

            if (!role) {
                throw AppError.notFound("Role not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Role deleted successfully",
                role
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }
}

export default new RoleFactory();
