import { Request, Response } from "express";
import leaveService from "../services/leave.service.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { IPaginationQuery } from "../interface/pagination.interface.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

class LeaveController {

  public async createLeave(req: Request, res: Response) {
    try {
      const result = await leaveService.createLeave(req.body);
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getAllLeaves(req: Request, res: Response) {
    try {
      const result = await leaveService.getAllLeaves(
        req.query as unknown as IPaginationQuery,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getLeavesByStaff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await leaveService.getLeavesByStaff(
        id as string,
        req.query as unknown as IPaginationQuery,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async approveLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await leaveService.approveLeave(id as string);
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async rejectLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await leaveService.rejectLeave(id as string);
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async deleteLeave(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const isAdmin = Array.isArray((req.user as any)?.role)
        && (req.user as any).role.some((role: any) =>
          typeof role !== "string" && role.name === "admin"
        );

      const result = await leaveService.deleteLeave(
        id as string,
        isAdmin ? undefined : req.user?._id?.toString(),
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}

export default new LeaveController();
