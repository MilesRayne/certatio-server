const io = require("socket.io");
const server = io.listen(3000);

const activeRooms = [];

server.on("connection", function (socket) {
  //pracenje sobe u kojoj je igrac, mozda postoji bolji nacin sa socket.rooms ?
  let currentRoom = null;
  socket.username = null;

  //logovanje konektovanja novog korisnika na server igre
  console.log("user", socket.id, "connected to the game server");
  socket.emit("welcome", "welcome man");

  //prihvatanje username-a korisnika
  socket.on("createUsername", (input) => {
    socket.username = input;
    console.log(
      "Player with ID:",
      socket.id,
      "has chosen the username:",
      socket.username
    );

    socket.emit("usernameConfirmed", socket.username);
  });

  //konektovanje u sobu
  socket.on("room:join", (roomID) => {
    //bilo bi korisno ubaciti da se korisnik diskonektuje iz svih ostalih soba pri ulasku u novu

    socket.join(roomID);
    currentRoom = roomID;

    //posalji nazad korisniku da se joinovao
    socket.emit("room:joined", roomID);

    //socket (korisnik koji ulazi) emituje drugima da je usao u sobu
    socket
      .to(roomID)
      .emit("room:userJoined", { id: socket.id, username: socket.username });

    if (!activeRooms.includes(roomID)) {
      activeRooms.push(roomID);

      //soba nije postojala, ovde treba pokrenuti igru?
    } else {
      //soba je postojala, posalji klijentu status igre?
    }
  });

  //Dobijanje liste igraca u nekoj sobi
  socket.on("request:playerlist", (roomID) => {
    currentPlayers = [];
    console.log("primio zahtev");
    let players = server.sockets.adapter.rooms[roomID].sockets;
    for (let playerID in players) {
      let clientSocket = server.sockets.connected[playerID];
      currentPlayers.push(clientSocket.username);
    }

    socket.emit("receive:playerlist", currentPlayers);
  });

  //Obavestiti druge igrace da je neko napustio igru
  socket.on("disconnect", () => {
    socket.to(currentRoom).emit("room:userLeft", socket.id);
  });
});
