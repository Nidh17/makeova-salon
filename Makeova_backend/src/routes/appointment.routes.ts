import { Router } from "express";
import appointmentController from "../controller/appointment.controller.js";

class AppotinmentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/create", appointmentController.createAppointment);
    this.router.patch("/update/:id", appointmentController.updateAppointment);
    this.router.get("/getall", appointmentController.getAllAppointments);
    this.router.get("/getbyid/:id", appointmentController.getAppointmentById);
    this.router.delete(
      "/deletebyid/:id",
      appointmentController.deleteAppointment,
    );

    this.router.get(
      "/getbystaff/:staffId",
      appointmentController.getAppointmentsByStaff,
    );

    this.router.get(
      "/getbydate/:date",
      appointmentController.getAppointmentsByDate,
    );

    this.router.patch(
      "/updatestatus/:id",
      appointmentController.updateAppointmentStatus,
    );

    this.router.post(
      "/check-availability",
      appointmentController.checkStaffAvailability,
    );
  }
}

export default new AppotinmentRoutes();
