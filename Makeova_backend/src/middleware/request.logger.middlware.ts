import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const startTime = Date.now();

    const { method, url, ip } = req;

    logger.info(`  INCOMING  [${method}] ${url} from ${ip}`);

    res.on("finish", () => {

        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        if (statusCode >= 500) {
            logger.error(` [${method}] ${url} → ${statusCode} | ⏱ ${duration}ms`);
        } else if (statusCode >= 400) {
            logger.warn(` [${method}] ${url} → ${statusCode} | ⏱ ${duration}ms`);
        } else {
            logger.info(` [${method}] ${url} → ${statusCode} | ⏱ ${duration}ms`);
        }
    });

    next();
};