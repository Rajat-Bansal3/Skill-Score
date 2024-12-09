import WebSocket, { WebSocketServer } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ClientMessage } from "./types";
import { createModels } from "@skill_score/shared";
import { errorHandler, SuccessHandler } from "./utils/responseHandlers";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
const { User, Room } = createModels(mongoose);

const wsServer = new WebSocketServer({ port: 8080 });
const userConnections = new Map<string, WebSocket>();

wsServer.on("connection", (socket: WebSocket) => {
  socket.on("message", async (message: WebSocket.RawData) => {
    try {
      const data = JSON.parse(message.toString()) as ClientMessage;
      userConnections.set(data.userId, socket);
      console.log(`${data.userId} has joined ${data.tournamentId}`);

      switch (data.type) {
        case "join_tournament":
          if (data.tournamentId) {
            await joinTournament(data.tournamentId, data.userId, socket);
          } else {
            socket.send(JSON.stringify({ error: "Invalid tournamentId" }));
          }
          break;

        case "leave_tournament":
          if (data.tournamentId) {
            await leaveTournament(data.tournamentId, data.userId, socket);
          } else {
            socket.send(JSON.stringify({ error: "Invalid tournamentId" }));
          }
          break;

        case "send_message":
          if (data.tournamentId && data.message) {
            await sendMessage(
              data.tournamentId,
              data.userId,
              data.message,
              socket
            );
          } else {
            socket.send(
              JSON.stringify({ error: "Invalid tournamentId or message" })
            );
          }
          break;

        default:
          socket.send(JSON.stringify({ error: "Unknown message type" }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ error: "Failed to process message" }));
    }
  });

  socket.on("close", () => {
    const userId = [...userConnections.entries()].find(
      ([_, connection]) => connection === socket
    )?.[0];

    if (userId) {
      userConnections.delete(userId);
      console.log(`User ${userId} disconnected.`);
    }
  });
});

const joinTournament = async (
  tournamentId: string,
  userId: string | undefined,
  socket: WebSocket
): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        tournament: tournamentId,
      },
      {
        new: true,
        projection: { passwordHash: 0 },
      }
    );
    const tournament = await Room.findByIdAndUpdate(
      tournamentId,
      {
        $addToSet: {
          currentUsers: userId,
        },
      },
      { new: true }
    );
    if (!user || !tournament)
      return errorHandler(
        socket,
        "Tournament or User doesnt Exists",
        "RESOURCE_NOT_FOUND",
        404
      );
    return SuccessHandler(
      socket,
      "joined Successfully",
      { user, tournament },
      200
    );
  } catch (error: any) {
    return errorHandler(socket, error);
  }
};

const leaveTournament = async (
  tournamentId: string,
  userId: string | undefined,
  socket: WebSocket
): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $unset: { tournament: "" },
      },
      {
        new: true,
        projection: { passwordHash: 0 },
      }
    );

    const tournament = await Room.findByIdAndUpdate(
      tournamentId,
      {
        $pull: { currentUsers: userId },
      },
      { new: true }
    );

    if (!user || !tournament)
      return errorHandler(
        socket,
        "Tournament or User doesn't exist",
        "RESOURCE_NOT_FOUND",
        404
      );

    return SuccessHandler(
      socket,
      "Left the tournament successfully",
      { user, tournament },
      200
    );
  } catch (error: any) {
    return errorHandler(socket, error);
  }
};

const sendMessage = async (
  tournamentId: string,
  userId: string | undefined,
  message: string,
  socket: WebSocket
): Promise<void> => {
  console.log(
    `User ${userId} sent message to tournament ${tournamentId}: ${message}`
  );
};
