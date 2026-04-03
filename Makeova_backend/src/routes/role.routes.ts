import { Router } from "express";
import roleController from "../controller/role.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";


class RoleRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/create", roleController.createRole);
    this.router.get("/getall", roleController.getallrole);
    this.router.get("/getbyid/:id", roleController.getRolebyId);
    this.router.patch("/updaterole/:id", roleController.updateRolebyId);
    this.router.patch("/deleterole/:id", 
       authMiddleware.Vaildatetoken,
      
      roleController.deleteRole);
  }
}
export default new RoleRoutes();
