const words = require('./words');

function generateWords(wordCount = 5) {
    const chosenWords = [];
    do {
        let word = words[Math.floor(Math.random() * words.length)];
        if (!chosenWords.includes(word) && !isContained(chosenWords, word)) chosenWords.push(word);
    } while (chosenWords.length < wordCount);
    console.log("New generated words are", chosenWords);
    return chosenWords;
}

function isContained(chosenWords, word) {

    for (let element of chosenWords) {
        if (element.includes(word) || word.includes(element)) {
            return true;
        }
    }

    return false;
}

function addPlayerToGameState(ID, username, gameState) {
    gameState.playerlist.push({
        username: username,
        ID: ID,
        lives: 3,
        alive: true
    });

    gameState.numOfPlayers++;

    return gameState;
}

function setInitialGameState(numOfLanes = 5) {

    let gameState = {
        lanes: [],
        numOfPlayers: 0,
        playerlist: [],
        deadPlayerlist: [],
        roundTime: 10000,
        round: 1,
        gameStarted: false
    };

    return gameState;
}

function setupLanes(gameState, numOfLanes = 5) {

    let limit = 5;

    numOfLanes = parseInt(numOfLanes);

    if (Number.isInteger(numOfLanes) && numOfLanes > 1 && numOfLanes < 7) {
        limit = numOfLanes;
    }

    for (let i = 0; i < limit; i++) {
        gameState.lanes.push({
            code: '',
            active: true,
            players: []
        })
    }


    console.log("pocetni game state je", gameState);
    gameState = pushWordsToGameState(gameState, gameState.lanes.length);

    return gameState;
}

function forcePlayersToLane(gameState) {

    console.log("broj lejnova je", gameState.lanes.length);
    let laneIndex = Math.ceil(gameState.lanes.length / 2) - 1;

    for (let player of gameState.playerlist) {
        gameState.lanes[laneIndex].players.push(player);
    }

    return gameState;
}

function pushWordsToGameState(gameState, numOfLanes = 5) {
    let generatedWords = generateWords(numOfLanes);
    for (let i = 0; i < numOfLanes; i++) {
        gameState.lanes[i].code = generatedWords[i];
    }

    return gameState;
}

function pushNewRoundGameState(gameState) {

    gameState = pushPlayerDataToGameState(gameState);

    numOfLanes = gameState.lanes.length;
    gameState = pushWordsToGameState(gameState, numOfLanes);
    gameState = pushInactiveLanesToGameState(gameState, numOfLanes);
    gameState.roundTime = pushNewRoundTime(gameState.roundTime);
    gameState.round++;


    return gameState;
}

function pushPlayerDataToGameState(gameState) {

    gameState = reducePlayerLives(gameState);
    gameState = changePlayerAliveState(gameState);

    return gameState;
}

function reducePlayerLives(gameState) {

    for (let lane of gameState.lanes) {
        if (lane.active == false) {

            for (let i = 0; i < lane.players.length; i++) {

                let playerID = lane.players[i].ID;

                for (let player of gameState.playerlist) {
                    if (player.ID == playerID) {
                        player.lives--;
                        break;
                    }
                }

            }
        }
    }

    return gameState;
}


function changePlayerAliveState(gameState) {

    for (let player of gameState.playerlist) {
        if (player.lives < 1 && player.alive) {
            player.alive = false;
            gameState = removeFromLane(player.ID, gameState);
            gameState.deadPlayerlist.push(player);
        }
    }

    return gameState;
}

function removeDeadPlayersFromPlayerlist(gameState) {

    for (let player of gameState.playerlist) {
        if (!player.alive) {

            let index = gameState.playerlist.indexOf(player);
            gameState.playerlist.splice(index, 1);
        }
    }

    return gameState;
}

function pushNewRoundTime(roundTime) {

    if (roundTime - 2000 >= 6000) {
        roundTime -= 2000;
    } else if (roundTime - 1000 >= 2000) {
        roundTime -= 1000;
    } else if (roundTime - 50 >= 1000) {
        roundTime -= 50;
    } else if (roundTime - 20 >= 500) {
        roundTime -= 20;
    }

    return roundTime;
}

function pushInactiveLanesToGameState(gameState, numOfLanes = 5) {

    let numOfInactive = Math.floor(Math.random() * (numOfLanes - 1) + 1);
    console.log("number of inactive lanes will be", numOfInactive);
    gameState = refreshLaneActivity(gameState);
    let chosenLanes = [];

    for (let i = 0; i < numOfInactive; i++) {
        let pushed = false;

        while (!pushed) {

            let randomLaneIndex = Math.floor(Math.random() * numOfLanes);
            if (!chosenLanes.includes(randomLaneIndex)) {
                chosenLanes.push(randomLaneIndex);
                pushed = true;
            }
        }
    }
    console.log("Chosen lane indexes are", chosenLanes);

    for (let i = 0; i < numOfInactive; i++) {
        gameState.lanes[chosenLanes[i]].active = false;
    }

    return gameState;
}

function refreshLaneActivity(gameState) {
    for (let lane of gameState.lanes) {
        lane.active = true;
    }

    return gameState;
}

function movePlayer(username, ID, typedCode, gameState) {
    for (let lane of gameState.lanes) {
        if (lane.code.toUpperCase() === typedCode.toUpperCase()) {
            lane.players = lane.players.filter(player => player.ID !== ID);
            lane.players.push({
                username: username,
                ID: ID
            });
        } else {
            lane.players = lane.players.filter(player => player.ID !== ID);
        }
    }

    console.log("ovo je novo", gameState);
    return gameState;
}

function removeFromLane(ID, gameState) {

    for (let lane of gameState.lanes) {
        lane.players = lane.players.filter(player => player.ID !== ID);
    }

    return gameState;
}

function removePlayer(ID, gameState) {

    gameState = removeFromLane(ID, gameState);
    gameState.numOfPlayers -= 1;

    let player = {
        ID: ID
    };

    let indexOfPlayer = gameState.playerlist.indexOf(player);
    gameState.playerlist.splice(indexOfPlayer, 1);
    return gameState;
}

module.exports = {
    generateWords,
    setInitialGameState,
    movePlayer,
    removePlayer,
    pushNewRoundGameState,
    addPlayerToGameState,
    setupLanes,
    removeDeadPlayersFromPlayerlist,
    forcePlayersToLane
}