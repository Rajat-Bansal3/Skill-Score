import WebSocket, { WebSocketServer } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ClientMessage } from "./types";
import { JwtPayload } from "jsonwebtoken";
import { AuthMiddleware } from "./middlewares/Auth.middleware";
import {
  joinTournament,
  leaveTournament,
  sendMessage,
} from "./functions/roomFunctions";
dotenv.config();

declare module "ws" {
  interface WebSocket {
    user?: JwtPayload;
  }
}

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const wsServer = new WebSocketServer({ port: Number(process.env.PORT!) });
const userConnections = new Map<string, WebSocket>();

wsServer.on("connection", (socket: WebSocket, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  AuthMiddleware(url, socket, userConnections);

  socket.on("message", async (message: WebSocket.RawData) => {
    try {
      const data = JSON.parse(message.toString()) as ClientMessage;
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
    }
  });
});
