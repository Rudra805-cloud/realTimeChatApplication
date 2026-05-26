import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

//iniciate soket.io and attach this to the http server

const io = new Server(server);

app.use(express.static("public"));

const users = new Set();

io.on("connection", (socket) => {
  console.log("a user connected");

  //handel user when they joing chat
  socket.on("join", (userName) => {
    if (!userName || userName.trim() === "") {
      return;
    }

    userName = userName.trim();
    socket.userName = userName;
    users.add(userName);

    //brodcast  to all clients/user that a new user has join
    io.emit("userJoined", userName);
    //send the updated user list to all client
    io.emit("userList", Array.from(users));
  });

  //handel incoming chat massage
  socket.on("chatMessage", (message) => {
    //brodcast the recieved massage to all connected client
    io.emit("chatMessage", message);
  });
  //handel user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.userName);

    users.delete(socket.userName);

    io.emit("userLeft", socket.userName);

    io.emit("userList", Array.from(users));
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log("server is running");
});
