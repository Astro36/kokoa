const CohensionExtractor = require('./CohensionExtractor');
const Utils = require('./Utils');

class LRTokenizer {
  constructor(scores) {
    this.scores = scores;
  }

  run(document) {
    const { scores } = this;
    const sentences = Utils.getAllSentences(document);
    const sentenceArray = [];
    for (const sentence of sentences) {
      const texts = Utils.getAllTexts(sentence);
      const textArray = [];
      for (const text of texts) {
        const subtexts = [];
        for (let i = 1, max = text.length; i <= max; i += 1) {
          const subtext = term.slice(0, i);
          subtexts.push(subtext);
        }
        textArray.push(subtexts.map(value => [value, scores[value]]).sort((a, b) => b[1] - a[1])[0]);
      }
      sentenceArray.push(textArray);
    }
    return sentenceArray;
  }
}

module.exports = LRTokenizer;
