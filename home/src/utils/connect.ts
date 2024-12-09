import mongoose from "mongoose";
require("dotenv").config();
export const connect = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    await mongoose.connect(dbURI!);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
