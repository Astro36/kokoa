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
  for (let i = 1, len = chunk.length; i <= len; i += 1) {
    subtexts.push([chunk.slice(0, i), chunk.slice(i)]);
  }
  subtextRecipes.set(chunk, subtexts);
  return subtexts;
};

/**
 * Class representing a word extracting engine.
 * @extends Engine
 */
class WordsEngine extends Engine {
  /**
   * Creates words engine instance.
   * @param {Object} [model] Words engine model.
   * @param {Array.<Array.<string|number>>} [model.frequencies]  How many times words appear.
   * @param {Array.<Array.<string|number>>} [model.scores] Words cohension n-gram value.
   */
  constructor({ frequencies, scores } = {}) {
    super();
    this.frequencies = new Map(frequencies);
    this.scores = new Map(scores);
  }

  /**
   * Loads words engine instance from the given file.
   * @param {string} file Words engine model file path.
   * @returns {WordsEngine} Words engine instance.
   */
  static load(file) {
    if (fs.existsSync(file)) {
      return WordsEngine.parse(fs.readFileSync(file).toString());
    }
    return null;
  }

  /**
   * Parses the given string to words engine instance.
   * @param {string} content Words engine model content.
   * @returns {WordsEngine} Words engine instance.
   */
  static parse(content) {
    const frequencies = [];
    const scores = [];
    content.split('\n').forEach((value) => {
      const [text, frequency, score] = value.split(',');
      frequencies.push([text, Number(frequency)]);
      scores.push([text, Number(score)]);
    });
    return new WordsEngine({ frequencies, scores });
  }

  /**
   * Returns how many times given word appears.
   * @param {string} word The word to be counted.
   * @return {number} How many times given word appears.
   */
  getFrequency(word) {
    const { frequencies } = this;
    return frequencies.has(word) ? frequencies.get(word) : 0;
  }

  /**
   * Splits the given chunk as LR parts.
   * @param {string} chunk The chunk to be analyzed. (must be hangul)
   * @returns {Array.<string>} LR parts from the given chunk.
   */
  run(chunk) {
    const { scores } = this;
    if (chunk.length === 1) {
      return [chunk];
    }
    const subtexts = extractSubtexts(chunk);
    const scoreList = subtexts.map(([leftSubtext, rightSubtext]) => [
      leftSubtext,
      rightSubtext,
      (scores.has(leftSubtext) ? scores.get(leftSubtext) : 0),
    ]);
    // scoreList length is always bigger than 1.
    if (scoreList.length >= 2) {
      const candidates = scoreList.filter(([, , score], index, array) => {
        const next = index === array.length - 1 ? 1 : array[index + 1][2];
        return score >= next;
      });
      if (candidates.length === 0) {
        return scoreList.map(([leftSubtext, rightSubtext, score]) => [
          leftSubtext,
          rightSubtext,
          score + (leftSubtext.length / 10000), // Prevents returning empty string.
        ]).reduce((r, a) => (a[2] > r[2] ? a : r)).slice(0, 2);
      } if (candidates.length === 1) {
        return candidates[0].slice(0, 2);
      }
      return candidates.map(([leftSubtext, rightSubtext, score]) => [
        leftSubtext,
        rightSubtext,
        score + (leftSubtext.length / 10000), // Prevents returning empty string.
      ]).reduce((r, a) => (a[2] > r[2] ? a : r)).slice(0, 2);
    }
    return [chunk];
  }

  /**
   * Saves words engine instance as a file.
   * @param {string} file Words engine model file path.
   */
  save(file) {
    fs.writeFileSync(file, this.stringify());
  }

  /**
   * Returns words engine instance as a string.
   * @returns {string} words engine model content.
   */
  stringify() {
    const { frequencies, scores } = this;
    const content = [];
    frequencies.forEach((frequency, text) => {
      content.push([text, frequency, scores.get(text)].join(','));
    });
    return content.join('\n');
  }

  /**
   * Trains the given chunks.
   * @param {Array.<string>} chunks The chunks to be trained. (must be hangul)
   */
  train(chunks) {
    const { frequencies } = this;
    // Extract all words and count how many words appear.
    chunks.map(extractSubtexts).forEach((subtexts) => {
      if (subtexts.length >= 2) { // Ignore one letter words.
        subtexts.forEach(([subtext]) => {
          if (frequencies.has(subtext)) {
            frequencies.set(subtext, frequencies.get(subtext) + 1);
          } else {
            frequencies.set(subtext, 1);
          }
        });
      }
    });
  }

  /** Updates calculated cohension n-gram value for each word. */
  update() {
    const { frequencies, scores } = this;
    frequencies.forEach((frequency, subtext, array) => {
      if (subtext.length === 1) {
        scores.set(subtext, 0);
      } else {
        const exp = 1 / subtext.length;
        scores.set(subtext, (frequency / array.get(subtext[0])) ** exp);
      }
    });
  }
}

module.exports = WordsEngine;
