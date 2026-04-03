import mongoose from "mongoose";
import { config } from "./config.js";
import { logger } from "../utils/logger.js";

class DBConnection {
  private static instance: DBConnection;
  private constructor() {}

  static getInstance(): DBConnection {
    if (!DBConnection.instance) {
      DBConnection.instance = new DBConnection();
    }
    return DBConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(config.MONGO_URL as string);
      logger.info("MongoDB Connected..");
    } catch (err) {
      logger.error("MongoDB connection error", {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
    }
  }
}

export const ConnectedDB = async (): Promise<void> => {
  DBConnection.getInstance().connect();
};


