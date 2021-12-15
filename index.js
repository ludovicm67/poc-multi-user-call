const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT || 8080;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

const activeUsers = {};

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    console.log('new user:', data);
    socket.userId = data.username;
    socket.room = data.room;
    if (!activeUsers.hasOwnProperty(data.room)) {
      activeUsers[data.room] = new Set();
    }
    activeUsers[data.room].add(data.username);
    io.emit("new user", [...activeUsers[data.room]]);
  });

  socket.on("disconnect", () => {
    if (activeUsers.hasOwnProperty(socket.room)) {
      activeUsers[socket.room].delete(socket.userId);
    }
    io.emit("user disconnected", socket.userId);
  });

  socket.on("msg", function (data) {
    io.emit("msg", data);
  });
});
