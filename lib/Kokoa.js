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
   * @returns {string} A spaced sentence.
   */
  spacing(document) {
    const { spacingEngine } = this;
    let output = document[0];
    for (let i = 0, len = document.length - 1; i < len; i += 1) {
      const bigram = document.slice(i, i + 2);
      const p = spacingEngine.run(bigram);
      if (p >= 0.5) {
        output += ` ${bigram[1]}`;
      } else {
        output += bigram[1];
      }
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
  words(document, { hangulOnly = true, minCount = 0 } = {}) {
    const { wordsEngine } = this;
    const chunks = this.chunks(document);
    const output = [];
    chunks.forEach((chunk) => {
      if (Hanguler.isHangul(chunk)) {
        const word = wordsEngine.run(chunk)[0];
        if (word && wordsEngine.getFrequency(word) >= minCount) {
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
