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
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");

    if (!res.socket.server.users) {
      res.socket.server.users = {};
    }

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

      const currentUser: User = {
        username: "",
        room: "",
      };

      socket.on("message", (data) => {
        io.emit("message", data);
      });

      socket.on("new user", function (data) {
        console.log('new user:', data);
        if (!res.socket.server.users.hasOwnProperty(data.room)) {
          res.socket.server.users[data.room] = {};
        }
        if (!res.socket.server.users[data.room].hasOwnProperty(data.username)) {
          res.socket.server.users[data.room][data.username] = {
            room: data.room,
            username: data.username,
          };
        }

        res.socket.server.users[data.room][data.username] = {
          room: data.room,
          username: data.username,
        };

        io.emit("new user", res.socket.server.users[data.room]);
      });

      socket.on("disconnect", () => {
        if (currentUser.room !== "" && res.socket.server.users.hasOwnProperty(currentUser.room)) {
          delete res.socket.server.users[currentUser.room][currentUser.username];
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
