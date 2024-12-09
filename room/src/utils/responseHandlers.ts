import Websocket from "ws";
export interface SocketResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
  statusCode: number; // Added statusCode
}

export const errorHandler = async (
  socket: Websocket,
  message?: string,
  errorCode?: string,
  statusCode: number = 500
) => {
  console.error(
    `Error: ${errorCode ?? "Unknown Error"}, Status: ${statusCode}`
  );
  const response: SocketResponse = {
    success: false,
    message: message ?? "Internal Server Error",
    error: errorCode ?? "Internal_Server_Error",
    statusCode,
  };
  socket.send(JSON.stringify(response));
};

export const SuccessHandler = (
  socket: Websocket,
  message?: string,
  data?: any,
  statusCode: number = 200
) => {
  const response: SocketResponse = {
    success: true,
    message: message ?? "Success",
    data,
    statusCode,
  };
  socket.send(JSON.stringify(response));
};
