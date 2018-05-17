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

const Hangul = require('hangul-js');

// Subtext extractor cache
const syllableRecipes = new Map();

/**
 * Extract chunks from the given document.
 * @private
 * @param {string} document The document to extract subtexts.
 * @returns {Array.<string>} Subtexts of the document.
 */
const extractChunks = (document) => {
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
};

/**
 * Extract subtexts from the given chunk.
 * @private
 * @param {string} chunk The document to extract chunks.
 * @returns {Array.<string>} Chunks of the document.
 */
const extractSubtexts = (chunk) => {
  if (syllableRecipes.has(chunk)) {
    return syllableRecipes.get(chunk);
  }
  const subtexts = [];
  const chars = Hangul.disassemble(chunk);
  for (let i = 1, len = chars.length; i <= len; i += 1) {
    const subtext = Hangul.assemble(chars.slice(0, i));
    if (!Hangul.isConsonant(subtext[subtext.length - 1])) {
      subtexts.push(subtext);
    }
  }
  syllableRecipes.set(chunk, subtexts);
  return subtexts;
};

/**
 * Object representing KokoaNLP model.
 * @typedef {Object} KokoaModel
 * @property {Array.<Array.<string|number>>} wordFrequencies How many times words appear.
 * @property {Array.<Array.<string|number>>} wordScores Words cohension n-gram value.
 */

/**
 * Class representing KokoaNLP.
 */
class Kokoa {
  /**
   * Create KokoaNLP instance.
   */
  constructor() {
    this.wordFrequencies = new Map();
    this.wordScores = new Map();
  }

  /**
   * Load KokoaNLP instance from the given model.
   * @param {KokoaModel} model KokoaNLP model
   */
  static load({ wordFrequencies, wordScores }) {
    const kokoa = new Kokoa();
    kokoa.wordFrequencies = new Map(wordFrequencies);
    kokoa.wordScores = new Map(wordScores);
    return kokoa;
  }

  /**
   * Analyze the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {boolean} [options.hangulOnly=true] If true, Only returns hangul contents.
   * @param {number} [options.threshold=5] Ignores all words with total frequency lower than this.
   * @returns {Array.<string>} Words of the document.
   */
  run(document, { hangulOnly = true, threshold = 5 } = {}) {
    const { wordFrequencies, wordScores } = this;
    const chunks = extractChunks(document);
    const words = [];
    chunks.forEach((chunk) => {
      if (Hangul.isHangulAll(chunk)) {
        const subtexts = extractSubtexts(chunk);
        const word = subtexts
          .map(subtext => [subtext, wordScores.has(subtext) ? wordScores.get(subtext) : 0])
          .reduce((r, a) => (a[1] > r[1] ? a : r))[0];
        if (wordFrequencies.get(word) >= threshold) {
          words.push(word);
        }
      } else if (!hangulOnly) {
        words.push(chunk);
      }
    });
    return words;
  }

  /**
   * Save KokoaNLP instance as a model.
   * @returns {KokoaModel} KokoaNLP model
   */
  save() {
    const { wordFrequencies, wordScores } = this;
    return {
      wordFrequencies: Array.from(wordFrequencies.entries()),
      wordScores: Array.from(wordScores.entries()),
    };
  }

  /**
   * Train the given document.
   * @param {string} document The document to be trained.
   */
  train(document) {
    const { wordFrequencies } = this;
    const chunks = extractChunks(document).filter(Hangul.isHangul).map(extractSubtexts);
    // Extract all words and count how many words appear.
    for (let i = 0, len = chunks.length; i < len; i += 1) {
      const subtexts = chunks[i];
      for (let j = 0, len2 = subtexts.length; j < len2; j += 1) {
        const subtext = subtexts[j];
        if (wordFrequencies.has(subtext)) {
          wordFrequencies.set(subtext, wordFrequencies.get(subtext) + 1);
        } else {
          wordFrequencies.set(subtext, 1);
        }
      }
    }
  }

  /** Update calculated cohension n-gram value for each word. */
  update() {
    const { wordFrequencies, wordScores } = this;
    wordFrequencies.forEach((frequency, subtext) => {
      if (subtext.length === 1) {
        wordScores.set(subtext, 0.1);
      } else {
        const exp = 1 / Hangul.disassemble(subtext).length;
        wordScores.set(subtext, (frequency / wordFrequencies.get(subtext[0])) ** exp);
      }
    });
  }
}

module.exports = Kokoa;
