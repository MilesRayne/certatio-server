const io = require("socket.io");
const server = io.listen(3000);
const {
  generateWords,
  setGameState,
  movePlayer,
  removePlayer,
  pushNewRoundGameState,
  addPlayerToGameState
} = require("./utils");

const activeRooms = [];
const gameStates = {};

server.on("connection", function (socket) {

  let currentRoom = null;
  let intervalVariable = null;
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

  socket.on("requestWords", (wordCount) => {
    socket.emit("returnWords", generateWords(wordCount));
  });

  //konektovanje u sobu
  socket.on("room:join", (roomID) => {

    //bilo bi korisno ubaciti da se korisnik diskonektuje iz svih ostalih soba pri ulasku u novu
    socket.join(roomID);
    currentRoom = roomID;

    //posalji nazad korisniku da se joinovao
    socket.emit("room:joined", roomID);


    console.log("Player ", socket.username, "has joined the room", roomID);

    //socket (korisnik koji ulazi) emituje drugima da je usao u sobu
    socket
      .to(roomID)
      .emit("room:userJoined", {
        id: socket.id,
        username: socket.username
      });

    if (!activeRooms.includes(roomID)) {
      activeRooms.push(roomID);
      gameState = setGameState(5);

      //novi timeout loop
      function timeoutLoop() {
        let roundTime = gameState.roundTime;
        intervalVariable = setTimeout(() => {
          gameStates[roomID] = pushNewRoundGameState(gameStates[roomID]);
          server.to(currentRoom).emit("refreshGameState", gameStates[currentRoom]);
          timeoutLoop();
        }, roundTime);
      }

      timeoutLoop();

    } else {}
    gameState = addPlayerToGameState(socket.id, socket.username, gameState);
    gameStates[roomID] = gameState;
    socket.emit("createLanes", gameState);
    socket.to(currentRoom).emit("refreshGameState", gameState);

    console.log("Trenutan broj igraca u sobi", roomID, "je", gameStates[roomID].numOfPlayers);
  });

  //Dobijanje liste igraca u nekoj sobi
  socket.on("request:playerlist", (roomID) => {
    currentPlayers = [];
    let players = server.sockets.adapter.rooms[roomID].sockets;
    for (let playerID in players) {
      let clientSocket = server.sockets.connected[playerID];
      currentPlayers.push(clientSocket.username);
    }

    socket.emit("receive:playerlist", currentPlayers);
  });

  socket.on("code:typed", (data) => {
    console.log("primio zahtev od", socket.username, ", ukucan kod: ", data);

    gameStates[currentRoom] = movePlayer(socket.username, socket.id, data, gameStates[currentRoom]);
    server.to(currentRoom).emit("refreshGameState", gameStates[currentRoom]);
  });

  //Obavestiti druge igrace da je neko napustio igru
  socket.on("disconnect", () => {
    if (currentRoom !== null) {
      socket.to(currentRoom).emit("room:userLeft", socket.id);
      gameStates[currentRoom] = removePlayer(socket.username, socket.id, gameStates[currentRoom]);
      socket.to(currentRoom).emit("refreshGameState", gameStates[currentRoom]);

      console.log("Trenutan broj igraca u sobi", currentRoom, "je", gameStates[currentRoom].numOfPlayers);

      //Remove empty rooms
      if (gameStates[currentRoom].numOfPlayers < 1) {
        clearTimeout(intervalVariable);

        let roomIndex = activeRooms.indexOf(currentRoom);
        activeRooms.splice(roomIndex, 1);
        console.log("Active rooms are now:", activeRooms);
      }
    }
  });
});