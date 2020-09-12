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

module.exports = {
    generateWords
}