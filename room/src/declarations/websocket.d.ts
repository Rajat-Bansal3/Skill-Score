import { JwtPayload } from "jsonwebtoken";
import WebSocket from "ws";

declare module "ws" {
  interface WebSocket {
    user?: JwtPayload;
  }
}
