import { Responsecodes } from "../enum/resposne.code.js";

export class AppError extends Error {
    readonly statusCode: number 
    readonly data?: any

    constructor(message: string, statusCode: number = 500, data: any = null) {
        super(message)           
        this.statusCode = statusCode;  
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string, data: any = null) {
        return new AppError(message, Responsecodes.BAD_REQUEST, data)
    }
    static unauthorized(message: string, data: any = null) {
        return new AppError(message, Responsecodes.UNAUTHORIZED, data)
    }
    static forbidden(message: string, data: any = null) {
        return new AppError(message, Responsecodes.FORBIDDEN, data)
    }
    static notFound(message: string, data: any = null) {
        return new AppError(message, Responsecodes.NOT_FOUND, data)
    }
    static conflict(message: string, data: any = null) {
        return new AppError(message, Responsecodes.CONFLICT, data)
    }
    static internal(message: string = "Internal Server Error", data: any = null) {
        return new AppError(message, Responsecodes.INTERNAL_SERVER_ERROR, data)
    }
}