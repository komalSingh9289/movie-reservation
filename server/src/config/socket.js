import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

   io.on("connection", (socket) => {
  socket.on("join-show", (showId) => {
    socket.join(showId);
  });

  socket.on("seat-locked", ({ showId, seats, userId }) => {
    socket.to(showId).emit("seat-locked", { seats, userId });
  });

  socket.on("seat-unlocked", ({ showId, seats }) => {
    socket.to(showId).emit("seat-unlocked", { seats });
  });
});

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
