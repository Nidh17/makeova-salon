import express from "express";
import dns from "dns";
import dotenv from "dotenv";
import { ConnectedDB } from "./config/db.js";
import { config } from "./config/config.js";
import { logger } from "./utils/logger.js";
import Routes from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sanitizeMiddleware } from "./middleware/sanitize.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request.logger.middlware.js";

dotenv.config();
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const app = express();
const PORT = config.PORT;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLoggerMiddleware);
app.use(sanitizeMiddleware);

app.use("/api/v1", Routes.router);

async function main() {
  await ConnectedDB();

  app.listen(PORT, () => {
    logger.info(`server running on port ${PORT}`);
  });
}
main();
