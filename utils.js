const words = require('./words');

function generateWords(wordCount = 5) {
    const chosenWords = [];
    do {
        let word = words[Math.floor(Math.random() * words.length)];
        if (!chosenWords.includes(word) && !isContained(chosenWords, word)) chosenWords.push(word);
    } while (chosenWords.length < wordCount);
    console.log(chosenWords);
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

function setGameState() {

    let gameState = {
        lanes: [{
                code: '',
                active: true,
                players: []
            },
            {
                code: '',
                active: true,
                players: []
            },
            {
                code: '',
                active: false,
                players: []
            },
            {
                code: '',
                active: false,
                players: []
            }, {
                code: '',
                active: true,
                players: []
            }
        ],
        numOfPlayers: {}
    };
    gameState.numOfPlayers = 1;
    gameState = pushWordsToGameState(gameState, 5);

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

    return gameState;
}

function pushInactiveLanesToGameState(gameState, numOfLanes = 5) {

    let numOfInactive = Math.floor(Math.random() * (numOfLanes - 1) + 1);
    console.log("number of inactive lanes will be", numOfInactive);
    gameState = refreshLaneActivity(gameState);

    let numOfSetLanes = 0;

    while (numOfSetLanes < numOfInactive) {
        for (let i = 0; i < numOfLanes; i++) {
            let chance = Math.random();
            if (chance >= (1 / numOfLanes) && gameState.lanes[i].active != false && numOfSetLanes < numOfInactive) {
                gameState.lanes[i].active = false;
                numOfSetLanes++;
                continue;
            }
        }
    }

    console.log("we have set", numOfSetLanes, "inactive lanes.");

    return gameState;
}

function refreshLaneActivity(gameState) {
    for (let lane of gameState.lanes) {
        lane.active = true;
    }

    return gameState;
}

function movePlayer(username, typedCode, gameState) {
    for (let lane of gameState.lanes) {
        if (lane.code.toUpperCase() === typedCode.toUpperCase()) {
            lane.players = lane.players.filter(player => player !== username);
            lane.players.push(username);
        } else {
            lane.players = lane.players.filter(player => player !== username);
        }
    }

    return gameState;
}

function removePlayer(username, gameState) {

    for (let lane of gameState.lanes) {
        lane.players = lane.players.filter(player => player !== username);
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