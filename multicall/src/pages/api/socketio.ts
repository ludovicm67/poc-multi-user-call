import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "src/types/next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { User } from "src/types/call";

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketio = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.users) {
    res.users = {};
  }

  if (!res.socket.server.io) {
    console.log("New Socket.io server...");

    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      allowEIO3: true,
    });

    io.on("connection", (socket) => {
      console.log("Made socket connection", socket.id);

      const socketId = socket.id;

      const currentUser: User = {
        username: "",
        room: "",
        id: socketId,
      };

      socket.on("message", (data) => {
        io.emit("message", data);
      });

      socket.on("user", function (data) {
        if (!data.from) {
          return;
        }

        console.log('user:', data);
        if (!res.users.hasOwnProperty(data.room)) {
          res.users[data.room] = {};
        }
        if (!res.users[data.room].hasOwnProperty(data.username)) {
          res.users[data.room][data.username] = {
            room: data.room,
            username: data.username,
            id: socketId,
          };
        }

        res.users[data.room][data.username] = {
          room: data.room,
          username: data.username,
          id: socketId,
        };

        io.emit("user", res.users[data.room]);
      });

      socket.on("disconnect", () => {
        if (currentUser.room !== "" && res.users.hasOwnProperty(currentUser.room)) {
          delete res.users[currentUser.room][currentUser.username];
        }
        io.emit("user disconnected", currentUser.username);
      });
    });

    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }
  res.end();
};

export default socketio;
