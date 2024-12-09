import { Response, Request, NextFunction, Router } from "express";
import { Role } from "../types/types";

export const AccessControl = (role: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.role as Role;
    if (!userRole) {
      res.status(403).json({ message: "Role not provided" });
      return;
    }

    if (role.includes(userRole)) {
      res
        .status(403)
        .json({ message: "Forbidden: You do not have the required role" });
      return;
    }
    next();
  };
};
