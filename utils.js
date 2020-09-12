const words = require('./words');

function generateWords(wordCount = 5) {
    const chosenWords = [];
    do {
        let word = words[Math.floor(Math.random() * words.length)];
        if (!chosenWords.includes(word)) chosenWords.push(word);
    } while (chosenWords.length < wordCount);
    console.log(chosenWords);
    return chosenWords;
}

module.exports = {
    generateWords
}