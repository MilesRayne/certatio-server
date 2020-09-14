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
        lives: 3
    });

    gameState.numOfPlayers++;

    return gameState;
}

function setInitialGameState(numOfLanes = 5) {

    let gameState = {
        lanes: [],
        numOfPlayers: 0,
        playerlist: [],
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

function pushNewRoundTime(roundTime) {

    if (roundTime > 2000) {
        roundTime -= 2000;
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

function removePlayer(username, ID, gameState) {

    for (let lane of gameState.lanes) {
        lane.players = lane.players.filter(player => player.ID !== ID);
    }
    gameState.numOfPlayers -= 1;

    let player = {
        username: username,
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
    setupLanes
}