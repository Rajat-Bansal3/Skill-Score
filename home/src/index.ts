import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { getCounter, saveCounter } from "./utils/getCounter";
import { validateQuery } from "./utils/validateQuery";
import { connect } from "./utils/connect";
import { AuthMiddleware } from "./middleware/auth.middleware";
import homeRouter from "./routers/room.router";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      email?: string;
      role?: string;
    }
  }
}

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
app.use(AuthMiddleware);
app.use("/home", homeRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const isDev = process.env.NODE_ENV === "development";
  console.log(process.env.NODE_ENV);
  if (isDev) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  }

  res.status(500).json({
    error: "Internal Server Error",
    ...(isDev && { message: err.message, stack: err.stack }),
  });
});

app.listen(5002, () => {
  console.log("http://localhost:5002");
});
