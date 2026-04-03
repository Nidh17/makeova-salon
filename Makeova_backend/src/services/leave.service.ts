import leaveFactory from "../factories/leave.factory.js";
import { logger } from "../utils/logger.js";
import { IPaginationQuery } from "../interface/pagination.interface.js";

class LeaveService {

  public async createLeave(data: any) {
    try {
      return await leaveFactory.createLeave(data);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getAllLeaves(query: IPaginationQuery) {
    try {
      return await leaveFactory.getAllLeaves(query);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getLeavesByStaff(staffId: string, query: IPaginationQuery) {
    try {
      return await leaveFactory.getLeavesByStaff(staffId, query);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async approveLeave(id: string) {
    try {
      return await leaveFactory.approveLeave(id);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async rejectLeave(id: string) {
    try {
      return await leaveFactory.rejectLeave(id);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async deleteLeave(id: string, userId?: string) {
    try {
      return await leaveFactory.deleteLeave(id, userId);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }
}

export default new LeaveService();
