const io = require("socket.io");
const server = io.listen(3000);
const {
  generateWords,
  setInitialGameState,
  movePlayer,
  removePlayer,
  pushNewRoundGameState,
  addPlayerToGameState,
  setupLanes,
  removeDeadPlayersFromPlayerlist,
  forcePlayersToLane
} = require("./utils");

const activeRooms = [];
const gameStates = {};
const intervalVariable = {};

server.on("connection", function (socket) {
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

  socket.on("requestWords", (wordCount) => {
    socket.emit("returnWords", generateWords(wordCount));
  });

  //konektovanje u sobu
  socket.on("room:join", (roomID) => {

    if (gameStates[roomID] != null && gameStates[roomID].gameStarted == true) {
      socket.emit("error-game-in-progress", roomID);
      return;
    } else {
      socket.join(roomID);
      currentRoom = roomID;

      //posalji nazad korisniku da se joinovao
      socket.emit("room:joined", roomID);

      console.log("Player ", socket.username, "has joined the room", roomID);

      //socket (korisnik koji ulazi) emituje drugima da je usao u sobu
      socket.to(roomID).emit("room:userJoined", {
        id: socket.id,
        username: socket.username,
      });

      if (!activeRooms.includes(roomID)) {
        activeRooms.push(roomID);
        gameStates[roomID] = setInitialGameState(5);

        //TODO: display host lobby screen - host treba da posalje "game:start" kad zeli da server zapocne igru
        socket.emit("game:signalAdmin");

      } else {}

      gameStates[currentRoom] = addPlayerToGameState(socket.id, socket.username, gameStates[currentRoom]);
      server.to(currentRoom).emit("refreshGameState", gameStates[currentRoom]);


      socket.on("game:start", (numOfLanes) => {
        gameStates[currentRoom].gameStarted = true;
        gameStates[currentRoom] = setupLanes(gameStates[currentRoom], numOfLanes);
        gameStates[currentRoom] = forcePlayersToLane(gameStates[currentRoom]);
        server.to(currentRoom).emit("game:started");
        server.to(currentRoom).emit("createLanes", gameStates[currentRoom]);
        server.to(currentRoom).emit("reset-timer", gameStates[currentRoom].roundTime);
        timeoutLoop(currentRoom);
      });

      console.log(
        "Trenutan broj igraca u sobi",
        roomID,
        "je",
        gameStates[roomID].numOfPlayers
      );
    }
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

    gameStates[currentRoom] = movePlayer(
      socket.username,
      socket.id,
      data,
      gameStates[currentRoom]
    );
    server.to(currentRoom).emit("refreshGameState", gameStates[currentRoom]);
  });

  //Obavestiti druge igrace da je neko napustio igru
  socket.on("disconnect", () => {
    if (currentRoom !== null) {
      socket.to(currentRoom).emit("room:userLeft", socket.id);
      gameStates[currentRoom] = removePlayer(
        socket.id,
        gameStates[currentRoom]
      );
      socket.to(currentRoom).emit("refreshGameState", gameStates[currentRoom]);

      console.log(
        "Trenutan broj igraca u sobi",
        currentRoom,
        "je",
        gameStates[currentRoom].numOfPlayers
      );

      //Remove empty rooms
      if (gameStates[currentRoom].numOfPlayers < 1) {

        removeEmptyRoom(currentRoom);
      }
    }
  });

  socket.on("leave-room", () => {
    socket.leave(currentRoom);
    currentRoom = null;
  })

  function timeoutLoop(currentRoom) {
    console.log("Ponavljam loop za sobu", currentRoom);
    let roundTime = gameStates[currentRoom].roundTime;
    intervalVariable[currentRoom] = setTimeout(() => {
      gameStates[currentRoom] = pushNewRoundGameState(gameStates[currentRoom]);
      let alivePlayers = alivePlayerCount(currentRoom);
      sendInfoToDeadPlayers(currentRoom, alivePlayers);
      gameStates[currentRoom] = removeDeadPlayersFromPlayerlist(gameStates[currentRoom]);
      server
        .to(currentRoom)
        .emit("refreshGameState", gameStates[currentRoom]);

      server.to(currentRoom).emit("reset-timer", gameStates[currentRoom].roundTime);
      if (alivePlayers > 1) {
        timeoutLoop(currentRoom);
      } else {
        removeEmptyRoom(currentRoom);
      }
    }, roundTime);
  }

  function sendInfoToDeadPlayers(currentRoom, alivePlayers) {

    if (alivePlayers == 0) {
      for (player of gameStates[currentRoom].playerlist) {
        server.to(player.ID).emit("enter-winner-screen", (gameStates[currentRoom].round - 1));
        server.to(currentRoom).emit("ask-to-leave");
      }
    } else {
      for (player of gameStates[currentRoom].playerlist) {

        if (!player.alive) {
          server.to(player.ID).emit("enter-spectator-screen", (gameStates[currentRoom].round - 2));
        } else if (alivePlayers == 1) {
          server.to(player.ID).emit("enter-winner-screen", gameStates[currentRoom].round - 1);
          server.to(currentRoom).emit("ask-to-leave");
        }
      }
    }
  }

  function alivePlayerCount(currentRoom) {

    let alivePlayerCount = 0;

    for (player of gameStates[currentRoom].playerlist) {
      if (player.alive) alivePlayerCount++;
    }

    return alivePlayerCount;
  }


  function removeEmptyRoom(currentRoom) {

    clearTimeout(intervalVariable[currentRoom]);

    let roomIndex = activeRooms.indexOf(currentRoom);
    activeRooms.splice(roomIndex, 1);
    console.log("Active rooms are now:", activeRooms);
    gameStates[currentRoom] = null;
  }

});