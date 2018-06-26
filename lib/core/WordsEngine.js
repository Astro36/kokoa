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

const Engine = require('./Engine');

// Subtext extractor cache
const subtextRecipes = new Map();

/**
 * Extracts subtexts from the given chunk.
 * @private
 * @param {string} chunk The chunk to extract subtexts.
 * @returns {Array.<Array.<string>>} Subtexts of the chunk.
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
 * Class representing a word extracting engine.
 */
class WordsEngine extends Engine {
  /**
   * Creates words engine instance.
   * @param {Object} [model] Words engine model.
   * @param {Array.<Array.<string|number>>} [model.originalFrequencies]
   *  How many times words appear.
   * @param {Array.<Array.<string|number>>} [model.originalScores] Words cohension n-gram value.
   * @param {Array.<Array.<string|number>>} [model.reversedFrequencies]
   *  How many times reversed words appear.
   * @param {Array.<Array.<string|number>>} [model.reversedScores]
   *  Reversed words cohension n-gram value.
   */
  constructor({
    originalFrequencies, originalScores, reversedFrequencies, reversedScores,
  } = {}) {
    super();
    this.originalFrequencies = new Map(originalFrequencies);
    this.originalScores = new Map(originalScores);
    this.reversedFrequencies = new Map(reversedFrequencies);
    this.reversedScores = new Map(reversedScores);
  }

  /**
   * Loads words engine instance from the given model.
   * @param {string} file Words engine model file path.
   * @returns {WordsEngine} Words engine instance.
   */
  static load(file) {
    if (fs.existsSync(file)) {
      const originalFrequencies = [];
      const originalScores = [];
      const reversedFrequencies = [];
      const reversedScores = [];
      let isOriginal = true;
      fs.readFileSync(file).toString().split('\n').forEach((value) => {
        if (value === '---') {
          isOriginal = false;
        } else {
          const [text, frequency, score] = value.split(',');
          if (isOriginal) {
            originalFrequencies.push([text, Number(frequency)]);
            originalScores.push([text, Number(score)]);
          } else {
            reversedFrequencies.push([text, Number(frequency)]);
            reversedScores.push([text, Number(score)]);
          }
        }
      });
      return new WordsEngine({
        originalFrequencies,
        originalScores,
        reversedFrequencies,
        reversedScores,
      });
    }
    return null;
  }

  /**
   * Returns how many times given word appears.
   * @param {string} word The word to be counted.
   * @return {number} How many times given word appears.
   */
  getFrequency(word) {
    const { originalFrequencies } = this;
    return originalFrequencies.has(word) ? originalFrequencies.get(word) : 0;
  }

  /**
   * Extracts a word from the given chunk.
   * @param {string} chunk The chunk to be analyzed. (must be hangul)
   * @returns {?string} A word from the given chunk.
   */
  run(chunk) {
    const { originalScores, reversedScores } = this;
    const subtexts = extractSubtexts(chunk);
    const scores = subtexts.map(([originalSubtext, reversedSubtext]) => [
      originalSubtext,
      reversedSubtext,
      (originalScores.has(originalSubtext) ? originalScores.get(originalSubtext) : 0.01),
      (reversedScores.has(reversedSubtext) ? reversedScores.get(reversedSubtext) : 0.01),
    ]);
    for (let i = 0; i < 3; i += 1) {
      let candidates;
      if (i === 0) {
        candidates = scores.filter(([, , originalScore, reversedScore], index, array) => {
          const nextOriginalScore = index === array.length - 1 ? 0 : array[index + 1][2];
          const previousReversedScore = index === 0 ? 0 : array[index - 1][3];
          return originalScore >= nextOriginalScore && reversedScore >= previousReversedScore;
        });
      } else if (i === 2) {
        candidates = scores.filter(([, , originalScore], index, array) => {
          const nextOriginalScore = index === array.length - 1 ? 0 : array[index + 1][2];
          return originalScore >= nextOriginalScore;
        });
      } else if (i === 1) {
        candidates = scores.filter(([, , , reversedScore], index, array) => {
          const previousReversedScore = index === 0 ? 0 : array[index - 1][3];
          return reversedScore >= previousReversedScore;
        });
      }
      if (candidates.length > 0) {
        const word = candidates.map(([originalSubtext, , originalScore]) => [
          originalSubtext,
          originalScore + (originalSubtext.length / 10000), // Prevents returning empty string.
        ]).reduce((r, a) => (a[1] > r[1] ? a : r))[0];
        return word;
      }
    }
    return null;
  }

  /**
   * Saves words engine instance as a file.
   * @param {string} file Words engine model file path.
   */
  save(file) {
    const {
      originalFrequencies, originalScores, reversedFrequencies, reversedScores,
    } = this;
    const content = [];
    originalFrequencies.forEach((frequency, text) => {
      content.push([text, frequency, originalScores.get(text)].join(','));
    });
    content.push('---');
    reversedFrequencies.forEach((frequency, text) => {
      content.push([text, frequency, reversedScores.get(text)].join(','));
    });
    fs.writeFileSync(file, content.join('\n'));
  }

  /**
   * Trains the given chunks.
   * @param {Array.<string>} chunks The chunks to be trained. (must be hangul)
   */
  train(chunks) {
    const { originalFrequencies, reversedFrequencies } = this;
    const chunkArr = chunks.map(extractSubtexts);
    // Extract all words and count how many words appear.
    for (let i = 0, len = chunkArr.length; i < len; i += 1) {
      const subtexts = chunkArr[i];
      if (subtexts.length > 2) { // Ignore one letter words.
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
  }

  /** Updates calculated cohension n-gram value for each word. */
  update() {
    const {
      originalFrequencies, originalScores, reversedFrequencies, reversedScores,
    } = this;
    originalFrequencies.forEach((frequency, subtext, frequencies) => {
      if (subtext.length === 0) {
        originalScores.set(subtext, 0);
      } else if (subtext.length === 1) {
        originalScores.set(subtext, 0);
      } else {
        const exp = 1 / subtext.length;
        originalScores.set(subtext, (frequency / frequencies.get(subtext[0])) ** exp);
      }
    });
    reversedFrequencies.forEach((frequency, subtext, frequencies) => {
      if (subtext.length === 0) {
        reversedScores.set(subtext, 0);
      } else if (subtext.length === 1) {
        reversedScores.set(subtext, 0);
      } else {
        const exp = 1 / subtext.length;
        reversedScores.set(subtext, (frequency / frequencies.get(subtext[0])) ** exp);
      }
    });
  }
}

module.exports = WordsEngine;
