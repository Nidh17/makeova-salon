import { Responsecodes } from "../enum/resposne.code.js";
import Leave from "../model/leave.schema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import paginationHelper from "../helper/pagination.helper.js";
import { IPaginationQuery } from "../interface/pagination.interface.js";
import { AppError } from "../utils/AppError.js";

class LeaveFactory {

  public async createLeave(data: any) {
    try {
      const leave = await Leave.create(data);

      return await ResponseHandler.sendResponse(
        Responsecodes.CREATED,
        "Leave applied successfully",
        leave
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getAllLeaves(query: IPaginationQuery) {
    try {
      const { page, limit, skip } = paginationHelper.parsePagination(query);
      const search =
        typeof query.search === "string" ? query.search.trim() : "";
      const status =
        typeof query.status === "string" ? query.status.trim() : "";
      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { reason: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ];
      }

      if (status) {
        filter.status = status;
      }

      const [leaves, totalItems] = await Promise.all([
        Leave.find(filter)
          .populate("staffId")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Leave.countDocuments(filter),
      ]);

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "All leaves fetched successfully",
        {
          items: leaves,
          pagination: paginationHelper.buildMeta(totalItems, page, limit),
        }
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getLeavesByStaff(staffId: string, query: IPaginationQuery) {
    try {
      const { page, limit, skip } = paginationHelper.parsePagination(query);
      const filter = { staffId };
      const [leaves, totalItems] = await Promise.all([
        Leave.find(filter)
          .populate("staffId")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Leave.countDocuments(filter),
      ]);

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "Leaves fetched successfully",
        {
          items: leaves,
          pagination: paginationHelper.buildMeta(totalItems, page, limit),
        }
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async approveLeave(id: string) {
    try {
      const leave = await Leave.findByIdAndUpdate(
        id,
        { status: "approved" },
        { new: true }
      );

      if (!leave) {
        return await ResponseHandler.sendResponse(
          Responsecodes.NOT_FOUND,
          "Leave not found",
          null
        );
      }

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "Leave approved successfully",
        leave
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async rejectLeave(id: string) {
    try {
      const leave = await Leave.findByIdAndUpdate(
        id,
        { status: "rejected" },
        { new: true }
      );

      if (!leave) {
        return await ResponseHandler.sendResponse(
          Responsecodes.NOT_FOUND,
          "Leave not found",
          null
        );
      }

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "Leave rejected successfully",
        leave
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async deleteLeave(id: string, userId?: string) {
    try {
      const leave = await Leave.findById(id);

      if (!leave) {
        return await ResponseHandler.sendResponse(
          Responsecodes.NOT_FOUND,
          "Leave not found",
          null
        );
      }

      if (leave.status !== "pending") {
        throw AppError.badRequest("Only pending leave requests can be cancelled");
      }

      if (userId && leave.staffId.toString() !== userId) {
        throw AppError.forbidden("You can cancel only your own leave request");
      }

      const deletedLeave = await Leave.findByIdAndDelete(id);

      return await ResponseHandler.sendResponse(
        Responsecodes.OK,
        "Leave cancelled successfully",
        deletedLeave
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }
}

export default new LeaveFactory();
