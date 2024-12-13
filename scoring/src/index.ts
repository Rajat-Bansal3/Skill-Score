import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import playerRouter from "./routers/index";
import morgan from "morgan";
dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));

app.use("/player", playerRouter);

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

app.listen(process.env.PORT, () => {
  console.log(`running on http://localhost:${process.env.PORT}`);
});
