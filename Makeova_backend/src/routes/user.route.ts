import { Router } from "express";
import userController from "../controller/user.controller.js";
import authController from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import permissionMiddleware from "../middleware/permission.middleware.js";
import { sanitizeMiddleware, validateMiddleware } from "../middleware/sanitize.middleware.js";
import { registerValidation, updateUserValidation } from "../validation/user.validation.js";

class UserRoute {
  public router: Router;
  constructor() {
    ((this.router = Router()), this.initializeRoutes());
  }
  private initializeRoutes(): void {
    this.router.post(
      "/register",
      sanitizeMiddleware,validateMiddleware({body:registerValidation}),
      authMiddleware.Vaildatetoken,
      permissionMiddleware.checkPermission("user"),
      userController.createUser,
    );
    this.router.get(
      "/getalluser",
      authMiddleware.Vaildatetoken,
      permissionMiddleware.checkPermission("user"),
      userController.getAllUsers,
    );
    this.router.get(
      "/getbyid/:id",
      authMiddleware.Vaildatetoken,
      permissionMiddleware.checkPermission("user"),
      userController.getUserById,
    );
    this.router.patch(
      "/updateuser/:id",
      authMiddleware.Vaildatetoken,
    validateMiddleware({body:updateUserValidation}),
      permissionMiddleware.checkPermission("user"),
      userController.updateUser,
    );
    this.router.delete("/delete/:id", userController.deleteUser);


   
    this.router.get('/me', authMiddleware.Vaildatetoken, authController.getMe)
    this.router.post("/login", authController.Userlogin);
    this.router.post('/logout',authController.logout)
    this.router.post("/refresh-token", authController.refreshToken);
  }
}

export default new UserRoute();
