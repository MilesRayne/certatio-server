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

function setGameState(numOfLanes = 5) {

    let gameState = {
        lanes: [],
        numOfPlayers: 1,
        roundTime: 10000
    };

    for (let i = 0; i < numOfLanes; i++) {
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

function pushNewRoundGameState(gameState, numOfLanes = 5) {
    gameState = pushWordsToGameState(gameState, numOfLanes);
    gameState = pushInactiveLanesToGameState(gameState, numOfLanes);
    gameState.roundTime = pushNewRoundTime(gameState.roundTime);

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
    return gameState;
}

module.exports = {
    generateWords,
    setGameState,
    movePlayer,
    removePlayer,
    pushNewRoundGameState
}