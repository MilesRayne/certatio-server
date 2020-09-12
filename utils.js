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

    const gameState = {
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
        ]
    };

    generatedWords = generateWords(5);
    for (let i = 0; i < 5; i++) {
        gameState.lanes[i].code = generatedWords[i];
    }

    return gameState;
}

function movePlayer(username, typedCode, gameState) {
    for (let lane of gameState.lanes) {
        if (lane.code.toUpperCase() === typedCode.toUpperCase()) {
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

    return gameState;
}

module.exports = {
    generateWords,
    setGameState,
    movePlayer,
    removePlayer
}