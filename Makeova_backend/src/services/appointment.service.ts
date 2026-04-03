import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import appointmentFactory from "../factories/appointment.factory.js";
import {
  IAppointmentPaginationQuery,
  ICreateAppointment,
  IUpdateAppointment,
} from "../interface/appointment.interface.js";

class AppointmentService {
  public async createAppointment(data: ICreateAppointment) {
    try {
      if (!data.userID || !data.staffID || !data.services) {
        throw AppError.badRequest("Required fields missing");
      }

      return await appointmentFactory.createAppointment(data);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getAllAppointments(query: IAppointmentPaginationQuery) {
    try {
      return await appointmentFactory.getAllAppointments(query);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getAppointmentById(id: string) {
    try {
      if (!id) {
        throw AppError.badRequest("Appointment id is required");
      }

      return await appointmentFactory.getAppointmentById(id);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getAppointmentsByStaff(
    staffId: string,
    query: IAppointmentPaginationQuery,
  ) {
    try {
      return await appointmentFactory.getAppointmentsByStaff(staffId, query);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async getAppointmentsByDate(
    date: string,
    query: IAppointmentPaginationQuery,
  ) {
    try {
      return await appointmentFactory.getAppointmentsByDate(date, query);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async updateAppointmentStatus(id: string, status: string) {
    try {
      return await appointmentFactory.updateAppointmentStatus(id, status);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }
  public async updateAppointment(id: string, data: IUpdateAppointment) {
    try {
      if (!id) {
        throw AppError.badRequest("Appointment id is required");
      }

      return await appointmentFactory.updateAppointment(id, data);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }

  public async deleteAppointment(id: string) {
    try {
      if (!id) {
        throw AppError.badRequest("Appointment id is required");
      }

      return await appointmentFactory.deleteAppointment(id);
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }
  public async checkStaffAvailability(
    staffId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    try {
      return await appointmentFactory.checkStaffAvailability(
        staffId,
        date,
        startTime,
        endTime,
      );
    } catch (err: any) {
      logger.error(err.message);
      throw err;
    }
  }
}

export default new AppointmentService();
