import { errorHandler } from "../utils/responseHandlers";
import WebSocket from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

export const AuthMiddleware = (
  url: URL,
  socket: WebSocket,
  userCon: Map<string, WebSocket>
) => {
  const query = url.searchParams.get("token");
  if (!query)
    return errorHandler(
      socket,
      "Auth Token Missing Or Invalid",
      "UNAUTHENTICATED",
      401
    );
  const token = query.split(" ")[1];
  if (!token)
    return errorHandler(
      socket,
      "Auth Token Missing Or Invalid",
      "UNAUTHENTICATED",
      401
    );
  try {
    const user = jwt.verify(token, process.env.PUBLIC_KEY!) as JwtPayload;
    // @ts-ignore
    socket.user = user;
    userCon.set(user.id, socket);
  } catch (error) {
    return errorHandler(
      socket,
      "Auth Token Missing Or Invalid",
      "UNAUTHENTICATED",
      401
    );
  }
};
