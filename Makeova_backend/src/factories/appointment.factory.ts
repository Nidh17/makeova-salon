import appointment from "../model/appointment.schema.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import { Responsecodes } from "../enum/resposne.code.js";
import {
  IAppointmentPaginationQuery,
  ICreateAppointment,
  IUpdateAppointment,
} from "../interface/appointment.interface.js";
import Leave from "../model/leave.schema.js";
import paginationHelper from "../helper/pagination.helper.js";

class AppointmentFactory {

    public async createAppointment(data: ICreateAppointment) {
        try {
            const newAppointment = await appointment.create({
                userID: data.userID,
                staffID: data.staffID,
                receptionistId: data.receptionistId,
                services: data.services,
                appointmentDate: data.appointmentDate,
                startTime: data.startTime,
                endTime: data.endTime,
                totalPrice: data.totalPrice,
                status: data.status,
                note: data.note
            });

            return await ResponseHandler.sendResponse(
                Responsecodes.CREATED,
                "Appointment created successfully",
                newAppointment
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getAllAppointments(query: IAppointmentPaginationQuery) {
        try {
            const { page, limit, skip } = paginationHelper.parsePagination(query);
            const search =
                typeof query.search === "string" ? query.search.trim() : "";
            const status =
                typeof query.status === "string" ? query.status.trim() : "";
            const filter: Record<string, unknown> = {};

            if (search) {
                filter.note = { $regex: search, $options: "i" };
            }

            if (status) {
                filter.status = status;
            }

            const [appointments, totalItems] = await Promise.all([
                appointment
                    .find(filter)
                    .populate("userID")
                    .populate("staffID")
                    .populate("receptionistId")
                    .populate("services")
                    .skip(skip)
                    .limit(limit)
                    .sort({ appointmentDate: -1 }),
                appointment.countDocuments(filter),
            ]);

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "All appointments fetched successfully",
                {
                    items: appointments,
                    pagination: paginationHelper.buildMeta(totalItems, page, limit),
                }
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async getAppointmentById(id: string) {
        try {
            const ap = await appointment
                .findById(id)
                .populate("userID")
                .populate("staffID")
                .populate("services");

            if (!ap) {
                throw AppError.notFound("Appointment not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Appointment fetched successfully",
                ap
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }
    public async getAppointmentsByStaff(
      staffId: string,
      query: IAppointmentPaginationQuery,
    ) {
  try {
    const { page, limit, skip } = paginationHelper.parsePagination(query);
    const filter = { staffID: staffId };
    const [appointments, totalItems] = await Promise.all([
      appointment
        .find(filter)
        .populate("userID")
        .populate("staffID")
        .populate("receptionistId")
        .populate("services")
        .skip(skip)
        .limit(limit)
        .sort({ appointmentDate: -1 }),
      appointment.countDocuments(filter),
    ]);

    return await ResponseHandler.sendResponse(
      Responsecodes.OK,
      "Appointments fetched by staff successfully",
      {
        items: appointments,
        pagination: paginationHelper.buildMeta(totalItems, page, limit),
      }
    );
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
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const { page, limit, skip } = paginationHelper.parsePagination(query);
    const filter = {
      appointmentDate: {
        $gte: start,
        $lte: end
      }
    };
    const [appointments, totalItems] = await Promise.all([
      appointment
        .find(filter)
        .populate("userID")
        .populate("staffID")
        .populate("receptionistId")
        .populate("services")
        .skip(skip)
        .limit(limit)
        .sort({ appointmentDate: -1 }),
      appointment.countDocuments(filter),
    ]);

    return await ResponseHandler.sendResponse(
      Responsecodes.OK,
      "Appointments fetched by date successfully",
      {
        items: appointments,
        pagination: paginationHelper.buildMeta(totalItems, page, limit),
      }
    );
  } catch (err: any) {
    logger.error(err.message);
    throw err;
  }
}

public async updateAppointmentStatus(id: string, status: string) {
  try {
    const updatedAppointment = await appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return await ResponseHandler.sendResponse(
        Responsecodes.NOT_FOUND,
        "Appointment not found",
        null
      );
    }

    return await ResponseHandler.sendResponse(
      Responsecodes.OK,
      "Appointment status updated successfully",
      updatedAppointment
    );
  } catch (err: any) {
    logger.error(err.message);
    throw err;
  }
}

    public async updateAppointment(id: string, data: IUpdateAppointment) {
        try {
            const updated = await appointment.findByIdAndUpdate(
                id,
                data,
                { new: true }
            );

            if (!updated) {
                throw AppError.notFound("Appointment not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Appointment updated successfully",
                updated
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async deleteAppointment(id: string) {
        try {
            const deleted = await appointment.findByIdAndDelete(id);

            if (!deleted) {
                throw AppError.notFound("Appointment not found")
            }

            return await ResponseHandler.sendResponse(
                Responsecodes.OK,
                "Appointment deleted successfully",
                deleted
            )
        } catch (err: any) {
            logger.error(err.message);
            throw err
        }
    }

    public async checkStaffAvailability(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  try {
    const dateObj = new Date(date);

   
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const onLeave = await Leave.findOne({
      staffId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: "approved",
    });

    if (onLeave) {
      return await ResponseHandler.sendResponse(
        Responsecodes.BAD_REQUEST,
        "Staff is on leave on this date",
        null
      );
    }

    const conflict = await appointment.findOne({
      staffID: staffId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed", "processing"] },
      $or: [
        {
          startTime: {
            $lt: new Date(endTime),
            $gte: new Date(startTime),
          },
        },
        {
          endTime: {
            $gt: new Date(startTime),
            $lte: new Date(endTime),
          },
        },
      ],
    });

    if (conflict) {
      return await ResponseHandler.sendResponse(
        Responsecodes.BAD_REQUEST,
        "Staff already has an appointment at this time",
        null
      );
    }

 
    return await ResponseHandler.sendResponse(
      Responsecodes.OK,
      "Staff is available",
      { available: true }
    );
  } catch (err: any) {
    logger.error(err.message);
    throw err;
  }
}
}

export default new AppointmentFactory();
