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
    gameState = pushWordsToLanes(gameState, 5);

    return gameState;
}

function pushWordsToLanes(gameState, numOfLanes = 5) {
    let generatedWords = generateWords(numOfLanes);
    for (let i = 0; i < numOfLanes; i++) {
        gameState.lanes[i].code = generatedWords[i];
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
    pushWordsToLanes
}