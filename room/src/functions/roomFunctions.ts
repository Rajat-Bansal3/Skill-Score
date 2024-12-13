import { createModels } from "@skill_score/shared";
import { errorHandler, SuccessHandler } from "../utils/responseHandlers";
import mongoose, { startSession } from "mongoose";
import WebSocket from "ws";

const { User, Room } = createModels(mongoose);

//connection maps
const tournamentConnections = new Map<string, Set<WebSocket>>();

export const joinTournament = async (
  tournamentId: string,
  userId: string | undefined,
  socket: WebSocket
): Promise<void> => {
  const session = await startSession();
  try {
    session.startTransaction();
    const user = await User.findOneAndUpdate(
      { _id: userId, tournament: { $exists: false } },
      {
        tournament: tournamentId,
        status: "INGAME",
      },
      {
        new: true,
        projection: { passwordHash: 0 },
        session,
      }
    );
    if (!user) {
      await session.abortTransaction();
      return errorHandler(
        socket,
        "User doesn't exist or already in a tournament",
        "CONFLICT",
        409
      );
    }
    const tournament = await Room.findByIdAndUpdate(
      tournamentId,
      {
        $addToSet: {
          currentUsers: userId,
        },
      },
      { new: true, session }
    );

    if (!tournament) {
      await session.abortTransaction();

      return errorHandler(
        socket,
        "Tournament doesnt Exists",
        "RESOURCE_NOT_FOUND",
        404
      );
    }
    session.commitTransaction();
    session.endSession();
    if (!tournamentConnections.has(tournamentId)) {
      tournamentConnections.set(tournamentId, new Set<WebSocket>());
    }
    tournamentConnections.get(tournamentId)?.add(socket);

    return SuccessHandler(
      socket,
      "joined Successfully",
      { user, tournament },
      200
    );
  } catch (error: any) {
    await session.abortTransaction();
    return errorHandler(socket, error);
  }
};

export const leaveTournament = async (
  tournamentId: string,
  userId: string | undefined,
  socket: WebSocket
): Promise<void> => {
  const session = await startSession();
  try {
    session.startTransaction();
    const user = await User.findOneAndUpdate(
      { _id: userId, tournament: tournamentId },
      {
        $unset: { tournament: "" },
        state: "OFFLINE",
      },
      {
        new: true,
        projection: { passwordHash: 0 },
        session,
      }
    );

    const tournament = await Room.findByIdAndUpdate(
      tournamentId,
      {
        $pull: { currentUsers: userId },
      },
      { new: true, session }
    );

    if (!user || !tournament) {
      session.abortTransaction();

      return errorHandler(
        socket,
        "Tournament or User doesn't exist",
        "RESOURCE_NOT_FOUND",
        404
      );
    }
    session.commitTransaction();
    session.endSession();
    tournamentConnections.get(tournamentId)?.delete(socket);
    return SuccessHandler(
      socket,
      "Left the tournament successfully",
      { user, tournament },
      200
    );
  } catch (error: any) {
    session.abortTransaction();
    return errorHandler(socket, error);
  }
};

export const sendMessage = async (
  tournamentId: string,
  userId: string | undefined,
  message: string,
  senderSocket: WebSocket
): Promise<void> => {
  const participants = tournamentConnections.get(tournamentId);

  if (!participants || participants.size === 0) {
    return errorHandler(
      senderSocket,
      "No Members in the tournament",
      "NOT_FOUND",
      404
    );
  }

  participants.forEach((participantSocket: WebSocket) => {
    if (
      senderSocket !== participantSocket &&
      participantSocket.readyState === WebSocket.OPEN
    ) {
      participantSocket.send(message, (err) => {
        if (err) {
          console.error(`Error sending message to participant: ${err}`);
        }
      });
    }
  });
};
export const updateLeaderBoard = async () => {}; //WIP:Leaderboard function
