import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "src/types/next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketio = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
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

      socket.on("message", (data) => {
        console.log(data);
        io.emit("message", data);
      });
    });

    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }
  res.end();
};

export default socketio;
