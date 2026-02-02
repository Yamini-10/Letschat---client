import { io } from "socket.io-client";

let socket: any;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};
