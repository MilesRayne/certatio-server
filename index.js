const io = require("socket.io");
const server = io.listen(3000);

server.on("connection", function (socket) {
  console.log("user connected");
  socket.emit("welcome", "welcome man");

  socket.on("join room", (data) => {
    console.log("joined room", data);
  });

  socket.on("room:create", (data) => {
    console.log("creating room", data);
    socket.join("MilesGayne");
  });
});
