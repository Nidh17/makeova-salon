import { Response } from "express"
import { AppError } from "./AppError.js"


export interface IResponse {
    code: number;
    message: string;
    data?: any;
}

class ResponseHandler{
    static async sendResponse(code:number,message:string,data:any =null):Promise<IResponse>{
            //logger.info("sendResponse called with:", { code, message, data }) 
        return{
            code,
            message,
            data
        }
    }
 
static async handleError(error: any): Promise<IResponse> {
    if (error instanceof AppError) {
        return this.sendResponse(
            error.statusCode,  
            error.message, 
            error.data ?? null
        )
    }

    if (error instanceof Error) {
        return this.sendResponse(
            500,
            error.message,
            null
        )
    }

    return this.sendResponse(
        500,
        "Internal Server Error",
        null
    )
}

    static handleResponse(res:Response,responseobj:any){
        res.status(responseobj.code).json(responseobj)
    }
    
}
export default ResponseHandler