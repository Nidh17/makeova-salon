import { Router } from "express";
import servicesController from "../controller/services.controller.js";

class servicesRoutes{
    public router:Router;
    constructor(){
        this.router=Router();
        this.initializeRoutes()
    }

    private initializeRoutes():void{
        this.router.post('/create',servicesController.createService)
        this.router.get('/getall',servicesController.getallServices)
        this.router.get('/getservice/:id',servicesController.getserviceByid)
        this.router.patch('/updateservice/:id',servicesController.updateService)
        this.router.delete('/deleteservice/:id',servicesController.deleteByid)

    }


}
export default new servicesRoutes()