import mongoose from "mongoose";

import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  if (!env.mongodbUri) {
    console.error("Database connection failed: MONGODB_URI is not configured.");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongodbUri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
