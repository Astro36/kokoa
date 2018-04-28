/* KokoaNLP
Copyright (C) 2018  Astro

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. */

const LRTokenizer = require('./tokenizer/LRTokenizer');
const SentenceTokenizer = require('./tokenizer/SentenceTokenizer');

/**
 * Type representing KokoaNLP output chuck.
 * @typedef {Array.<string>} KokoaChunk
 */

/**
 * Type representing KokoaNLP sentence.
 * @typedef {Array.<KokoaChunk>} KokoaSentence
 */

/**
 * Type representing KokoaNLP output.
 * @typedef {Array.<KokoaSentence>} KokoaResult
 */

/**
 * Class representing KokoaNLP.
 */
class Kokoa {
  constructor() {
    this.dictionary = null;
    this.lrTokenizer = null;
    this.sentenceTokenizer = null;
  }

  /**
   * Initialize the dictionary and tokenizers.
   * @param {Dictionary} dictionary
   */
  load(dictionary) {
    this.dictionary = dictionary;
    this.lrTokenizer = new LRTokenizer(dictionary);
    this.sentenceTokenizer = new SentenceTokenizer();
  }

  /**
   * Analyze the given document.
   * @param {string} document
   * @returns {KokoaResult}
   */
  run(document) {
    const { lrTokenizer, sentenceTokenizer } = this;
    const sentences = sentenceTokenizer.run(document);
    const sentencesOut = [];
    const hangulRegex = /^[ㄱ-ㅎ가-힣]+$/;
    for (let i = 0, len = sentences.length; i < len; i += 1) {
      const sentence = sentences[i];
      const sentenceOut = [];
      for (let j = 0, len2 = sentence.length; j < len2; j += 1) {
        const chuck = sentence[j];
        if (hangulRegex.test(chuck)) {
          sentenceOut.push(lrTokenizer.run(chuck));
        } else {
          sentenceOut.push([chuck]);
        }
      }
      sentencesOut.push(sentenceOut.filter(Boolean));
    }
    return sentencesOut;
  }
}

module.exports = Kokoa;
