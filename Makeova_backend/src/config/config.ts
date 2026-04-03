import dotenv from "dotenv";

dotenv.config();
export const config = {
  MONGO_URL: process.env.MONGO_URL as string,
  PORT: process.env.PORT,
  ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY as string,
  REFRESH_SCCRET_KEY: process.env.REFRESH_SCCRET_KEY as string,
};
