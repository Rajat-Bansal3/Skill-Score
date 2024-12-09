import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape } from "zod";

export const validateQuery =
  (schema: ZodObject<ZodRawShape>, type: "query" | "body" | "params") =>
  (req: Request, res: Response, next: NextFunction) => {
    let data;

    switch (type) {
      case "query":
        data = req.query;
        break;
      case "body":
        data = req.body;
        break;
      case "params":
        data = req.params;
        break;
    }

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    next();
  };
