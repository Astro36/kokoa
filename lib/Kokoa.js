const LRTokenizer = require('./tokenizer/LRTokenizer')
const SentenceTokenizer = require('./tokenizer/SentenceTokenizer')

class Kokoa {
  constructor() {
    this.lrTokenizer = null;
    this.sentenceTokenizer = null;
  }

  load(dictionary) {
    this.lrTokenizer = new LRTokenizer(dictionary);
    this.sentenceTokenizer = new SentenceTokenizer();
  }

  /**
   * @param {string} document
   */
  run(document) {
    const { lrTokenizer, sentenceTokenizer } = this;
    const sentences = sentenceTokenizer.run(document);
    const sentencesOut = [];
    const hangulRegex = /^[ㄱ-ㅎ가-힣]+$/;
    for (const sentence of sentences) {
      const sentenceOut = [];
      for (const chuck of sentence) {
        if (hangulRegex.test(chuck)) {
          sentenceOut.push(lrTokenizer.run(chuck));
        } else {
          sentenceOut.push(chuck);
        }
      }
      sentencesOut.push(sentenceOut);
    }
    return sentencesOut;
  }

  /**
   * @param {string} document
   */
  train(document) {

  }
}

module.exports = Kokoa;
