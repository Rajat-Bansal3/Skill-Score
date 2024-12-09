import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../types/responseHandle";
import jwt from "jsonwebtoken";
import fs from "fs";
import { env } from "process";

export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth) return errorHandler(res, "UNAUTHENTICATED", "Missing token", 401);
  const token = auth.split(" ")[1];
  if (!token)
    return errorHandler(
      res,
      "UNAUTHENTICATED",
      "Missing or invalid token",
      401
    );

  try {
    const publicKey = fs.readFileSync(env.PUBLIC_KEY_PATH!, "utf-8");
    const decoded = jwt.verify(token, publicKey);

    if (typeof decoded === "object" && decoded) {
      req.id = decoded.id as string;
      req.email = decoded.email as string;
      req.role = decoded.role as string;
      next();
    } else {
      throw new Error("Invalid token structure");
    }
  } catch (error) {
    return errorHandler(
      res,
      "UNAUTHENTICATED",
      "Invalid or expired token",
      401
    );
  }
};
