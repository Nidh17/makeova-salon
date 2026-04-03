import { Router } from "express";
import userRoute from "./user.route.js";
import roleRoutes from "./role.routes.js";
import permissionRoutes from "./permission.routes.js";
import serviceRoutes from "./service.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import authMiddleware from "../middleware/auth.middleware.js";
import permissionMiddleware from "../middleware/permission.middleware.js";
import leaveRoutes from "./leave.routes.js";

class Routes {
  public router: Router;
  constructor() {
    ((this.router = Router()), this.initializeRoutes());
  }
  private initializeRoutes(): void {
    this.router.use("/user", 
     
      userRoute.router);
    this.router.use(
      "/role",
       authMiddleware.Vaildatetoken,
       permissionMiddleware.checkPermission('role'),
      roleRoutes.router,
    );
    this.router.use(
      "/permission",
       authMiddleware.Vaildatetoken,
       permissionMiddleware.checkPermission('permission'),
      permissionRoutes.router,
    );
    this.router.use(
      "/service",
       authMiddleware.Vaildatetoken,
       permissionMiddleware.checkPermission('service'),
      serviceRoutes.router,
    );
    this.router.use(
      "/appointment",
       authMiddleware.Vaildatetoken,
       permissionMiddleware.checkPermission('appointment'),
       appointmentRoutes.router,
    );
      this.router.use(
      "/leave",
       authMiddleware.Vaildatetoken,
       permissionMiddleware.checkPermission('leave'),
       leaveRoutes.router,
    );
  }
}
export default new Routes();
