import user from "../model/user.schema.js";
import Role from "../model/role.schema.js";
import { logger } from "../utils/logger.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { Responsecodes } from "../enum/resposne.code.js";
import {
  ICreateUser,
  IUpdateUser,
  IUserPaginationQuery,
} from "../interface/user.interface.js";
import paginationHelper from "../helper/pagination.helper.js";

class UserFactory {

  public async createUser(data: ICreateUser, req: AuthRequest) {

    try {

      const existing = await user.findOne({ email: data.email });

      if (existing) {
        throw  AppError.conflict("User already exists");
      }

      const loggedUser = req.user;

      if (!loggedUser) {
        throw AppError.unauthorized("Unauthorized user");
      }

      const creator = await user
        .findById(loggedUser._id)
        .populate("role");

      if (!creator) {
        throw AppError.notFound("Creator not found");
      }

      const creatorRole: any = creator.role[0];

      const roleToAssign = data.role;

      const allowed = creatorRole.canAssignRoles?.some(
        (r: any) => r.toString() === roleToAssign.toString()
      );

      if (!allowed) {
        throw AppError.unauthorized("You are not allowed to assign this role");
      }

      const newUser = await user.create({
        ...data,
        
        createdBy: loggedUser._id
      });

    
    return ResponseHandler.sendResponse(
      Responsecodes.OK,
      "user created ",
      newUser

    )

    } catch (err: any) {

      logger.error("factory " + err.message);
      throw  Error(err.message);

    }

  }

  public async getAllUsers(query: IUserPaginationQuery) {
    const { page, limit, skip } = paginationHelper.parsePagination(query);
    const search =
      typeof query.search === "string" ? query.search.trim() : "";
    const role =
      typeof query.role === "string" ? query.role.trim() : "";
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phonenumber: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      const matchingRoles = await Role.find({
        name: { $regex: `^${role}$`, $options: "i" },
      }).select("_id");

      filter.role = { $in: matchingRoles.map((item) => item._id) };
    }

    const [alluser, totalItems] = await Promise.all([
      user
        .find(filter)
        .populate("role")
        .populate("specialization")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      user.countDocuments(filter),
    ]);

    return ResponseHandler.sendResponse(
      Responsecodes.OK,
      "All Users ",
      {
        items: alluser,
        pagination: paginationHelper.buildMeta(totalItems, page, limit),
      }
    )
  }

  public async getUserById(id: string) {

    const u = await user
      .findById(id)
      .populate("role")
      .populate("specialization")
      .populate("createdBy", "name email");

    if (!u) {
      throw AppError.notFound("User not found");
    }

    //return u;

   return ResponseHandler.sendResponse(
      Responsecodes.OK,
      "All Users",
      u

    )
  }

  public async updateUser(id: string, data: IUpdateUser) {

    const updateUser= await user.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
  return  ResponseHandler.sendResponse(
      Responsecodes.OK,
      "user Updated Sucessfully",
      updateUser
    )

  }

  public async deleteUser(id: string) {

    const deleteduser= await user.findByIdAndDelete(id);
   return  ResponseHandler.sendResponse(
      Responsecodes.OK,
      "user deleted Sucessfully",
      deleteduser
    )

  }

}

export default new UserFactory();
