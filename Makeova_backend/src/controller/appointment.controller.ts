import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import appointmentService from "../services/appointment.service.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import {
  IAppointmentPaginationQuery,
  ICreateAppointment,
  IUpdateAppointment,
} from "../interface/appointment.interface.js";

class AppointmentController {
  public async createAppointment(req: Request, res: Response) {
    try {
      const result = await appointmentService.createAppointment(
        req.body as ICreateAppointment,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      logger.error(err.message);
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getAllAppointments(req: Request, res: Response) {
    try {
      const result = await appointmentService.getAllAppointments(
        req.query as unknown as IAppointmentPaginationQuery,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getAppointmentById(req: Request, res: Response) {
    try {
      const result = await appointmentService.getAppointmentById(
        req.params.id as string,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getAppointmentsByStaff(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      const result = await appointmentService.getAppointmentsByStaff(
        staffId as string,
        req.query as unknown as IAppointmentPaginationQuery,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async getAppointmentsByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;

      if (!date || Array.isArray(date)) {
        throw new Error("Invalid date format");
      }
      const result = await appointmentService.getAppointmentsByDate(
        date,
        req.query as unknown as IAppointmentPaginationQuery,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async updateAppointmentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await appointmentService.updateAppointmentStatus(
        id as string,
        status,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
  public async updateAppointment(req: Request, res: Response) {
    try {
      const result = await appointmentService.updateAppointment(
        req.params.id as string,
        req.body as IUpdateAppointment,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  public async deleteAppointment(req: Request, res: Response) {
    try {
      const result = await appointmentService.deleteAppointment(
        req.params.id as string,
      );
      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
  public async checkStaffAvailability(req: Request, res: Response) {
    try {
      const { staffId, date, startTime, endTime } = req.body;

      const result = await appointmentService.checkStaffAvailability(
        staffId,
        date,
        startTime,
        endTime,
      );

      ResponseHandler.handleResponse(res, result);
    } catch (err: any) {
      const errorResponse = await ResponseHandler.handleError(err);
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}

export default new AppointmentController();
