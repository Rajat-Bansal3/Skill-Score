import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import CircuitBreaker from "opossum";
import { Request, Response, NextFunction } from "express";
import { AuthMiddleware } from "./middlewares/auth.middleware";

const app = express();
app.use(morgan("combined"));

declare global {
  namespace Express {
    interface Request {
      id?: string;
      role?: string;
      email?: string;
    }
  }
}

const authServiceBreaker = new CircuitBreaker(
  (req: Request, res: Response) =>
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: false,
    })(req, res),
  {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

const roomServiceBreaker = new CircuitBreaker(
  (req: Request, res: Response) =>
    createProxyMiddleware({
      target: "http://localhost:5002",
      changeOrigin: false,
    })(req, res),
  {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

app.use("/auth", (req: Request, res: Response, next: NextFunction) => {
  authServiceBreaker.fire(req, res).catch((err) => {
    res.status(503).json({ error: "Auth service is unavailable" });
  });
});

app.use(
  "/home",
  AuthMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    roomServiceBreaker.fire(req, res).catch((err) => {
      res.status(503).json({ error: "Room service is unavailable" });
    });
  }
);

app.listen(5000, () => {
  console.log("API Gateway is running on port 5000");
});
