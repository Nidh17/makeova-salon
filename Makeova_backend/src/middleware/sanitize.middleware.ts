import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import ResponseHandler from "../utils/ResponseHandler.js";

export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const sanitizeInput = (input: any) => {
            if (typeof input === 'string') {
                return input.replace(/<\/?[^>]+(>|$)/g, "");
            } else if (typeof input === 'object' && input !== null) {
                Object.keys(input).forEach(key => {
                    input[key] = sanitizeInput(input[key]);
                });
            }
            return input;
        };

        if (req.query.sortField !== undefined) {
            req.query.sortBy = req.query.sortField;
        }

        req.body = sanitizeInput(req.body);

        Object.keys(req.query).forEach(key => {
            (req.query as any)[key] = sanitizeInput(req.query[key]);
        });

        Object.keys(req.params).forEach(key => {
            (req.params as any)[key] = sanitizeInput(req.params[key]);
        });

        next();

    } catch (err: any) {
        logger.error(err.message)
        ResponseHandler.handleError(err).then(errorResponse => {
            ResponseHandler.handleResponse(res, errorResponse)
        })
    }
};

type ValidationTarget = 'body' | 'query' | 'params';
type SchemaMap = Partial<Record<ValidationTarget, ZodType>>;

export const validateMiddleware = (schemas: SchemaMap) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors: any[] = [];

            (Object.keys(schemas) as ValidationTarget[]).forEach((key) => {
                const schema = schemas[key];
                if (!schema) return;

                const result = schema.safeParse(req[key]);

                if (!result.success) {
                    errors.push({
                        target: key,
                        issues: result.error.issues,
                    });
                } else {
                    if (key === 'body') {
                        req[key] = result.data as any;
                    } else if (key === 'query' || key === 'params') {
                        const validatedData = result.data as Record<string, any>;

                        Object.keys(req[key]).forEach(prop => {
                            delete (req[key] as any)[prop];
                        });

                        Object.keys(validatedData).forEach(prop => {
                            (req[key] as any)[prop] = validatedData[prop];
                        });
                    }
                }
            });

            if (errors.length > 0) {
                throw AppError.badRequest("Invalid request data")
            }

            next();

        } catch (err: any) {
            logger.error(err.message)
            const errorResponse = await ResponseHandler.handleError(err)
            ResponseHandler.handleResponse(res, errorResponse)
        }
    };
};