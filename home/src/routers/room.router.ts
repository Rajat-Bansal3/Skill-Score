import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { AccessControl } from "../middleware/AccessControl.middleware";
import { createModels } from "@skill_score/shared";
import { RoomSchema, RoomType, UpdateRoom } from "../types/types";
import { errorHandler, SuccessHandler } from "../types/responseHandle";
import { validateQuery } from "../utils/validateQuery";
import z from "zod";
import mongoose from "mongoose";
const router = Router();

const { Room } = createModels(mongoose);

const getRoomsReqSchema = z.object({
  page: z.coerce
    .number()
    .min(1, "Page must be greater than 0")
    .positive("Page must be positive")
    .default(1),

  limit: z.coerce
    .number()
    .min(1, "Limit must be greater than 0")
    .positive("Limit must be positive")
    .default(10),
});

router.get(
  "/",
  AccessControl(["admin", "user", "subscriber"]),
  validateQuery(getRoomsReqSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const start = (page - 1) * limit;
    try {
      const totalRooms = await Room.countDocuments();
      if (totalRooms === 0)
        return errorHandler(
          res,
          "NO_RESOURCE_AVAILABLE",
          "no rooms are available at the moment",
          404
        );
      const rooms: RoomType[] = await Room.find().limit(limit).skip(start);

      return SuccessHandler(res, "rooms fetched successfully", {
        page,
        limit,
        total: totalRooms,
        rooms,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  AccessControl(["admin", "subscriber"]),
  validateQuery(RoomSchema, "body"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { name, state, maxMembers, currentUsers, expiresAt } = req.body;
      expiresAt = expiresAt ?? Date.now() + 60 * 60 * 60 * 1000;
      const newRoom = new Room({
        name,
        state,
        maxMembers,
        currentUsers,
        expiresAt,
      });
      await newRoom.save();
      return SuccessHandler(res, "Successfully Created New Room", newRoom._id);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/",
  AccessControl(["admin", "subscriber"]),
  async (
    req: Request<{}, {}, {}, { tournamentId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { tournamentId } = req.query;
    try {
      const tournament = await Room.findByIdAndDelete(tournamentId, {
        new: true,
      });
      if (!tournament)
        return errorHandler(
          res,
          "RESOURCE_NOT_FOUND",
          "No Tournament with the id given available",
          404
        );
      return SuccessHandler(res, "Tournament Deleted Successfully", null);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/",
  AccessControl(["admin"]),
  validateQuery(RoomSchema.partial(), "body"),
  async (
    req: Request<{}, {}, {}, { tournamentId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { tournamentId } = req.query;
    const updates: UpdateRoom = req.body;
    try {
      const tournament = await Room.findByIdAndUpdate(
        tournamentId,
        {
          $set: updates,
        },
        { new: true }
      );
      if (!tournament)
        return errorHandler(
          res,
          "RESOURCE_NOT_FOUND",
          "No Tournament Found with the given id",
          404
        );
      return SuccessHandler(
        res,
        "Tournament updated successfully",
        tournament._id
      );
    } catch (error) {
      next(error);
    }
  }
);
export default router;
