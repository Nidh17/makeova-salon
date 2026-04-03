import { Router } from "express";
import leaveController from "../controller/leave.controller.js";

class LeaveRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/create', leaveController.createLeave);
    this.router.get('/getall', leaveController.getAllLeaves);
    this.router.get('/getbystaff/:id', leaveController.getLeavesByStaff);
    this.router.patch('/approve/:id', leaveController.approveLeave);
    this.router.patch('/reject/:id', leaveController.rejectLeave);
    this.router.delete('/delete/:id', leaveController.deleteLeave);
  }
}

export default new LeaveRoutes();
