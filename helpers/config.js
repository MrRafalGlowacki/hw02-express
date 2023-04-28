import dotenv from "dotenv";

dotenv.config();

export const config = {
  MONGODB_URI: process.env.DB_HOST,
  JWT_SECRET: process.env.JWT_SECRET,
};