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

  static load(file = 'kokoa.*.csv') {
    if (/\.\*\.csv$/.test(file)) {
      const spacingFile = file.replace(/\.\*\.csv$/, '.spacing.csv');
      const spacingEngine = SpacingEngine.load(spacingFile);
      const wordsFile = file.replace(/\.\*\.csv$/, '.words.csv');
      const wordsEngine = WordsEngine.load(wordsFile);
      return new Kokoa({ spacingEngine, wordsEngine });
    }
    return null;
  }

  /**
   * Returns chunks from the given document.
   * @param {string} document The document to extract chunks.
   * @returns {Array.<string>} Chunks of the document.
   */
  chunks(document) {
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
  * Returns morphs of the given document.
  * @param {string} document The document to be analyzed.
  * @param {Object} [options] Document analyzer options.
  * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
  * @param {number} [options.minCount=5] Ignores all morphs with total frequency lower than this.
  * @returns {Array.<string>} Morphs of the document.
  */
  morphs(document, { hangulOnly = true, minCount = 10 } = {}) {
    const { wordsEngine } = this;
    const chunks = this.chunks(document);
    const output = [];
    chunks.forEach((chunk) => {
      if (Hanguler.isHangul(chunk)) {
        const word = wordsEngine.run(chunk);
        if (wordsEngine.getFrequency(word[0]) >= minCount) {
          output.push(word[0]);
          if (word[1]) {
            output.push(word[1]);
          }
        }
      } else if (!hangulOnly) {
        output.push(chunk);
      }
    });
    return output;
  }

  /**
   * Saves KokoaNLP instance as a file.
   * @param {string} [file='kokoa.*.csv'] KokoaNLP model file path.
   */
  save(file = 'kokoa.*.csv') {
    if (/\.\*\.csv$/.test(file)) {
      const { spacingEngine, wordsEngine } = this;
      spacingEngine.save(file.replace(/\.\*\.csv$/, '.spacing.csv'));
      wordsEngine.save(file.replace(/\.\*\.csv$/, '.words.csv'));
    }
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

  /**
   * Returns spaced sentence from the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options] Document analyzer options.
   * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
   * @returns {string} A spaced sentence.
   */
  spacing(document, { hangulOnly = true } = {}) {
    const { spacingEngine } = this;
    const input = document.replace(/[^가-힣]|\s/g, '');
    let output = input[0] + input[1];
    for (let i = 0, len = input.length - 2; i < len; i += 1) {
      const quodgram = input.slice(i, i + 3);
      const p = spacingEngine.run(quodgram);
      if (p >= 0.7) {
        output += ` ${quodgram[2]}`;
      } else {
        output += quodgram[2];
      }
    }
    if (!hangulOnly) {
      // will be added.
    }
    return output;
  }

  /**
   * Trains the given document.
   * @param {string} document The document to be trained.
   */
  train(document) {
    const { spacingEngine, wordsEngine } = this;
    const chunks = this.chunks(document).filter(Hanguler.isHangul);
    spacingEngine.train(chunks);
    wordsEngine.train(chunks);
  }

  /** Updates calculated value for each data. */
  update() {
    const { spacingEngine, wordsEngine } = this;
    spacingEngine.update();
    wordsEngine.update();
  }

  /**
   * Returns words of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options] Document analyzer options.
   * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [options.minCount=5] Ignores all words with total frequency lower than this.
   * @returns {Array.<string>} Words of the document.
   */
  words(document, { hangulOnly = true, minCount = 10 } = {}) {
    const { wordsEngine } = this;
    const chunks = this.chunks(document);
    const output = [];
    chunks.forEach((chunk) => {
      if (Hanguler.isHangul(chunk)) {
        const word = wordsEngine.run(chunk)[0];
        if (wordsEngine.getFrequency(word) >= minCount) {
          output.push(word);
        }
      } else if (!hangulOnly) {
        output.push(chunk);
      }
    });
    return output;
  }
}

module.exports = Kokoa;
