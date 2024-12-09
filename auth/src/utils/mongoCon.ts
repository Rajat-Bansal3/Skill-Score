import mongoose from "mongoose";
import { env } from "../types/env";
export const connect = async () => {
  try {
    const dbURI = env.MONGO_URI;
    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
