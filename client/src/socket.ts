

import { io } from "socket.io-client";
export const socket = io("https://yt-watch-party-backend.onrender.com", {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log(" SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log(" SOCKET DISCONNECTED");
});