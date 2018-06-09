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

const fs = require('fs');
const Hanguler = require('hanguler');

// Subtext extractor cache
const subtextRecipes = new Map();

/**
 * Extracts chunks from the given document.
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
 * Extracts subtexts from the given chunk.
 * @private
 * @param {string} chunk The document to extract chunks.
 * @returns {Array.<Array.<string>>} Chunks of the document.
 */
const extractSubtexts = (chunk) => {
  if (subtextRecipes.has(chunk)) {
    return subtextRecipes.get(chunk);
  }
  const subtexts = [];
  const chars = chunk;
  for (let i = 0, len = chars.length; i <= len; i += 1) {
    subtexts.push([chars.slice(0, i), chars.slice(i).split('').reverse().join('')]);
  }
  subtextRecipes.set(chunk, subtexts);
  return subtexts;
};

/**
 * Class representing KokoaNLP.
 */
class Kokoa {
  /**
   * Creates KokoaNLP instance.
   * @param {Array.<Array.<string|number>>} originalFrequencies How many times words appear.
   * @param {Array.<Array.<string|number>>} reversedFrequencies
   *  How many times reversed words appear.
   * @param {Array.<Array.<string|number>>} originalScores Words cohension n-gram value.
   * @param {Array.<Array.<string|number>>} reversedScores Reversed words cohension n-gram value.
   */
  constructor(originalFrequencies, reversedFrequencies, originalScores, reversedScores) {
    this.originalFrequencies = new Map(originalFrequencies);
    this.reversedFrequencies = new Map(reversedFrequencies);
    this.originalScores = new Map(originalScores);
    this.reversedScores = new Map(reversedScores);
  }

  /**
   * Loads KokoaNLP instance from the given model.
   * @param {string} file KokoaNLP model file path.
   * @returns {Kokoa} KokoaNLP instance.
   */
  static loadFile(file) {
    if (fs.exists(file)) {
      const content = fs.readFileSync(file).split('\n').map(value => value.split(','));
      const originalFrequencies = content.map(value => [value[0], Number(value[1])]);
      const reversedFrequencies = content.map(value => [value[0], Number(value[2])]);
      const originalScores = content.map(value => [value[0], Number(value[3])]);
      const reversedScores = content.map(value => [value[0], Number(value[4])]);
      return new Kokoa(originalFrequencies, reversedFrequencies, originalScores, reversedScores);
    }
    return null;
  }

  /**
   * Returns ohw many times given word appears.
   * @param {string} word The word to be counted.
   * @return {number} How many times given word appears.
   */
  getFrequency(word) {
    const { originalFrequencies } = this;
    return originalFrequencies.has(word) ? originalFrequencies.get(word) : 0;
  }

  /**
   * Document analyzer options
   * @typedef {Object} KokoaOptions
   * @property {boolean} [hangulOnly=true] If true, only returns hangul contents.
   * @property {number} [minCount=5] Ignores all words with total frequency lower than this.
   */

  /**
   * Analyzes the given document.
   * @param {string} document The document to be analyzed.
   * @param {KokoaOptions} [options] Document analyzer options
   * @returns {Array.<string>} Words of the document.
   */
  run(document, { hangulOnly = true, minCount = 5 } = {}) {
    const { originalFrequencies, originalScores, reversedScores } = this;
    const chunks = extractChunks(document);
    const words = [];
    chunks.forEach((chunk) => {
      if (Hanguler.isHangul(chunk)) {
        const subtexts = extractSubtexts(chunk);
        const word = subtexts.map(([originalSubtext, reversedSubtext]) => [
          originalSubtext,
          reversedSubtext,
          (originalScores.has(originalSubtext) ? originalScores.get(originalSubtext) : 0.01),
          (reversedScores.has(reversedSubtext) ? reversedScores.get(reversedSubtext) : 0.01),
        ]).filter(([, , originalScore, reversedScore], index, array) => {
          const nextOriginalScore = index === array.length - 1 ? 0 : array[index + 1][2];
          const nextReversedScore = index === array.length - 1 ? 0 : array[index + 1][3];
          return originalScore >= nextOriginalScore && reversedScore >= nextReversedScore;
        }).map(([originalSubtext, , originalScore]) => [
          originalSubtext,
          originalScore + (originalSubtext.length / 10000), // Prevents returning empty string.
        ]).reduce((r, a) => (a[1] > r[1] ? a : r))[0];
        if (originalFrequencies.get(word) >= minCount) {
          words.push(word);
        }
      } else if (!hangulOnly) {
        words.push(chunk);
      }
    });
    return words;
  }

  /**
   * Saves KokoaNLP instance as a file.
   * @param {string} file KokoaNLP model file path.
   */
  // saveFile(file) {
  //   const { lFrequencies, lScores, rFrequencies, rScores } = this;
  //   const content = lFrequencies.entries()
  //     .map(([l, lFrequency]) => [l, lFrequency, lScores.get(l)].join(','))
  //     .join('\n');
  //   fs.writeFileSync(file, content);
  // }

  /**
   * Trains the given document.
   * @param {string} document The document to be trained.
   */
  train(document) {
    const { originalFrequencies, reversedFrequencies } = this;
    const chunks = extractChunks(document).filter(Hanguler.isHangul).map(extractSubtexts);
    // Extract all words and count how many words appear.
    for (let i = 0, len = chunks.length; i < len; i += 1) {
      const subtexts = chunks[i];
      for (let j = 0, len2 = subtexts.length; j < len2; j += 1) {
        const [originalSubtext, reversedSubtext] = subtexts[j];
        if (originalFrequencies.has(originalSubtext)) {
          originalFrequencies.set(originalSubtext, originalFrequencies.get(originalSubtext) + 1);
        } else {
          originalFrequencies.set(originalSubtext, 1);
        }
        if (reversedFrequencies.has(reversedSubtext)) {
          reversedFrequencies.set(reversedSubtext, reversedFrequencies.get(reversedSubtext) + 1);
        } else {
          reversedFrequencies.set(reversedSubtext, 1);
        }
      }
    }
  }

  /** Updates calculated cohension n-gram value for each word. */
  update() {
    const {
      originalFrequencies, originalScores, reversedFrequencies, reversedScores,
    } = this;
    originalFrequencies.forEach((frequency, subtext, frequencies) => {
      if (subtext.length === 0) {
        originalScores.set(subtext, 0.01);
      } else if (subtext.length === 1) {
        originalScores.set(subtext, 0.01);
      } else {
        const exp = 1 / subtext.length;
        originalScores.set(subtext, (frequency / frequencies.get(subtext[0])) ** exp);
      }
    });
    reversedFrequencies.forEach((frequency, subtext, frequencies) => {
      if (subtext.length === 0) {
        reversedScores.set(subtext, 0.01);
      } else if (subtext.length === 1) {
        reversedScores.set(subtext, 0.01);
      } else {
        const exp = 1 / subtext.length;
        reversedScores.set(subtext, (frequency / frequencies.get(subtext[0])) ** exp);
      }
    });
  }
}

module.exports = Kokoa;
