import { Router } from "express";
import permissionController from "../controller/permission.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

class PermissionRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/create",
      authMiddleware.Vaildatetoken,
      permissionController.createPermission,
    );
    this.router.get("/getall", permissionController.getallPermission);
    this.router.get("/getbyid/:id", permissionController.getPermissionByid);
    this.router.patch(
      "/update/:id",
      authMiddleware.Vaildatetoken,
      permissionController.updatePermission,
    );
    this.router.delete(
      "/delete/:id",
      authMiddleware.Vaildatetoken,
      permissionController.deletePermission,
    );
  }
}
export default new PermissionRoute();
