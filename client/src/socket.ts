// import { io } from 'socket.io-client';

// const URL = 'http://localhost:5000';

// export const socket = io(URL, {
//   autoConnect: true,
// });




// import { io } from "socket.io-client";

// export const socket = io("http://localhost:5000", {
//   transports: ["websocket"],
// });


// import { io } from "socket.io-client";

// export const socket = io("http://localhost:5000", {
//   transports: ["websocket"],
// });

// socket.on("connect", () => {
//   console.log("🔥 SOCKET CONNECTED:", socket.id);
// });

// socket.on("disconnect", () => {
//   console.log("❌ SOCKET DISCONNECTED");
// });


import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("🔥 SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ SOCKET DISCONNECTED");
});