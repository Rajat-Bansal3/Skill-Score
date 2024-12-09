import { Request, Response, NextFunction } from "express";

export const errorHandler = async (
  res: Response,
  error?: string,
  message?: string,
  errorCode?: number
) => {
  res.status(errorCode ?? 500).json({
    success: false,
    message: message ?? "Internal Server Error",
    error: message ?? "Internal_Server_Error",
  });
};

export const SuccessHandler = (res: Response, message?: string, data?: any) => {
  res.status(200).json({ success: true, message: message ?? "Success", data });
};
