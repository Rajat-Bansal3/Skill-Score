import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { AuthRouter } from "./routers/index";
import { getCounter, saveCounter } from "./utils/reqcounter";
import { connect } from "./utils/mongoCon";
import { verifyEmail, verifyPhone } from "./controllers/auth.controller";
import { env } from "./types/env";
connect();
let requestCount = getCounter();
const app = express();
app.use((req, res, next) => {
  requestCount++;
  saveCounter(requestCount);
  console.log(`Request Count: ${requestCount}`);
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// Routers
app.use("/auth", AuthRouter);
app.use("/verify-email", verifyEmail);
app.use("/verify-phone", verifyPhone);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  }

  res.status(500).json({
    error: "Internal Server Error",
    ...(isDev && { message: err.message, stack: err.stack }),
  });
});

app.listen(env.PORT, () => {
  console.log("http://localhost:5001");
});
