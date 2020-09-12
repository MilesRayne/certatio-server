const io = require("socket.io");
const server = io.listen(3000);

server.on("connection", function (socket) {
  //pracenje sobe u kojoj je igrac, mozda postoji bolji nacin sa socket.rooms ?
  let currentRoom = null;
  let players = null;
  let username = null;

  //logovanje konektovanja novog korisnika na server igre
  console.log("user", socket.id, "connected to the game server");
  socket.emit("welcome", "welcome man");

  //prihvatanje username-a korisnika
  socket.on("createUsername", (input) => {
    username = input;
    console.log("Player with ID:", socket.id, "has chosen the username:", username);

    socket.emit("usernameConfirmed");
  })

  //konektovanje u sobu
  socket.on("room:join", (roomID) => {
    //bilo bi korisno ubaciti da se korisnik diskonektuje iz svih ostalih soba pri ulasku u novu

    socket.join(roomID);
    currentRoom = roomID;
    //posalji nazad korisniku da se joinovao
    socket.emit("room:joined", roomID);

    //socket (korisnik koji ulazi) emituje drugima da je usao u sobu
    socket.to(roomID).emit("room:userJoined", socket.id);
  });

  //Obavestiti druge igrace da je neko napustio igru
  socket.on("disconnect", () => {
    socket.to(currentRoom).emit("room:userLeft", socket.id);
  });
});