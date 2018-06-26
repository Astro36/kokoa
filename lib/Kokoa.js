/* KokoaNLP
Copyright (C) 2018  Seungjae Park

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

/* eslint class-methods-use-this: off */

const Hanguler = require('hanguler');

const SpacingEngine = require('./core/SpacingEngine');
const WordsEngine = require('./core/WordsEngine');

/**
 * Class representing KokoaNLP.
 */
class Kokoa {
  constructor({ spacingEngine = new SpacingEngine(), wordsEngine = new WordsEngine() } = {}) {
    this.spacingEngine = spacingEngine;
    this.wordsEngine = wordsEngine;
  }

  /**
   * Returns chunks from the given document.
   * @param {string} document The document to extract chunks.
   * @returns {Array.<string>} Chunks of the document.
   */
  chunks() {
    const alphabetRegex = /^[A-z]+$/;
    const hangulRegex = /^[가-힣]+$/;
    const numberRegex = /^[0-9]+$/;
    const chunks = [];
    document.split('').forEach((char) => {
      const previousChunk = chunks[chunks.length - 1] || '';
      if ((alphabetRegex.test(previousChunk) && alphabetRegex.test(char)) // if char is alphabet
        || (hangulRegex.test(previousChunk) && hangulRegex.test(char)) // if char is hangul
        || (numberRegex.test(previousChunk) && numberRegex.test(char)) // if char is number
        || (previousChunk[previousChunk.length - 1] === char)) { // if char is repeated
        chunks[chunks.length - 1] += char;
      } else {
        chunks.push(char);
      }
    });
    return chunks;
  }

  /**
   * Returns keysentences of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {number} [options.count=10] How many words return as keysentences.
   * @param {boolean} [options.training=true] If true, trains KokoaNLP before the document analyzes.
   * @returns {Array.<string>} keysentences of the document.
   */
  keysentences() {

  }

  /**
   * Returns keywords of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {number} [options.count=10] How many words return as keysentences.
   * @param {boolean} [options.training=true] If true, trains KokoaNLP before the document analyzes.
   * @returns {Array.<string>} Keywords of the document.
   */
  keywords() {

  }

  /**
   * Returns sentences of the given document.
   * @param {string} document The document to be analyzed.
   * @returns {Array.<string>} Sentences of the document.
   */
  sentences(document) {
    return document.match(/[^.!?…\s][^.!?…]*(?:[.!?…](?!['"]?\s|$)[^.!?…]*)*[.!?…]?['"]?(?=\s|$)/g)
      .map(value => value.split(/\n+/))
      .reduce((accumulator, currentValue) => {
        if (typeof currentValue === 'string') {
          accumulator.push(currentValue);
        } else {
          accumulator.push(...currentValue);
        }
        return accumulator;
      }, [])
      .filter(Boolean);
  }

  spacing() {

  }

  /**
   * Returns words of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options] Document analyzer options
   * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [options.minCount=5] Ignores all words with total frequency lower than this.
   * @returns {Array.<string>} Words of the document.
   */
  words(document, { hangulOnly = true, minCount = 0 } = {}) {
    const { wordsEngine } = this;
    const chunks = this.chunks(document);
    const words = [];
    chunks.forEach((chunk) => {
      if (Hanguler.isHangul(chunk)) {
        const word = wordsEngine.run(chunk);
        if (word && wordsEngine.getFrequency(word) >= minCount) {
          words.push(word);
        }
      } else if (!hangulOnly) {
        words.push(chunk);
      }
    });
    return words;
  }
}

module.exports = Kokoa;
