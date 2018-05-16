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

/**
 * Extract chunks from the given document.
 * @private
 * @param {string} document
 * @returns {Array.<string>}
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
 * @param {string} chunk
 * @returns {Array.<string>}
 */
const extractSubtexts = (chunk) => {
  const subtexts = [];
  const chars = Hangul.disassemble(chunk);
  for (let i = 1, len = chars.length; i <= len; i += 1) {
    const subtext = Hangul.assemble(chars.slice(0, i));
    if (!Hangul.isConsonant(subtext[subtext.length - 1])) {
      subtexts.push(subtext);
    }
  }
  return subtexts;
};

/**
 * Class representing KokoaNLP.
 */
class Kokoa {
  /**
   * Create KokoaNLP instance.
   */
  constructor() {
    this.wordFrequencies = {};
    this.wordScores = {};
  }

  /**
   * Train the given document.
   * @param {string} document
   */
  train(document) {
    const { wordFrequencies, wordScores } = this;
    const chunks = extractChunks(document).filter(Hangul.isHangul).map(extractSubtexts);
    // Extract all words and count how many words appear.
    for (let i = 0, len = chunks.length; i < len; i += 1) {
      const subtexts = chunks[i];
      for (let j = 0, len2 = subtexts.length; j < len2; j += 1) {
        const subtext = subtexts[j];
        if (subtext in wordFrequencies) {
          wordFrequencies[subtext] += 1;
        } else {
          wordFrequencies[subtext] = 1;
        }
      }
    }
    // Calculate cohension n-gram value.
    const uniqueSubtexts = Object.keys(wordFrequencies);
    for (let i = 0, len = uniqueSubtexts.length; i < len; i += 1) {
      const subtext = uniqueSubtexts[i];
      if (subtext.length === 1) {
        wordScores[subtext] = 0.1;
      } else {
        const exp = 1 / Hangul.disassemble(subtext).length;
        wordScores[subtext] = (wordFrequencies[subtext] / wordFrequencies[subtext[0]]) ** exp;
      }
    }
  }

  /**
   * Analyze the given document.
   * @param {string} document
   * @param {Object} [options]
   * @param {boolean} [options.hangulOnly=true]
   * @param {number} [options.threshold=3]
   * @returns {Array.<string>}
   */
  run(document, { hangulOnly = true, threshold = 3 } = {}) {
    const { wordFrequencies, wordScores } = this;
    const chunks = extractChunks(document);
    const words = [];
    chunks.forEach((chunk) => {
      if (Hangul.isHangulAll(chunk)) {
        const subtexts = extractSubtexts(chunk);
        const word = subtexts.map(value => [value, value in wordScores ? wordScores[value] : 0])
          .reduce((r, a) => (a[1] > r[1] ? a : r))[0];
        if (wordFrequencies[word] >= threshold) {
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
