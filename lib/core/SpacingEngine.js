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

const Engine = require('./Engine');

/**
 * Class representing a sentence spacing engine.
 * @extends Engine
 */
class SpacingEngine extends Engine {
/**
   * Creates words engine instance.
   * @param {Object} [model] Words engine model.
   * @param {Array.<Array.<string|number>>} [model.frequencies]
   *  How many times words appear.
   * @param {Array.<Array.<string|number>>} [model.scores] Words cohension n-gram value.
   */
  constructor({
    frequencies, scores,
  } = {}) {
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
      const frequencies = [];
      const scores = [];
      fs.readFileSync(file).toString().split('\n').forEach((value) => {
        const [text, frequency, score] = value.split(',');
        frequencies.push([text, Number(frequency)]);
        scores.push([text, Number(score)]);
      });
      return new WordsEngine({
        frequencies,
        scores,
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
    const { frequencies } = this;
    return frequencies.has(word) ? frequencies.get(word) : 0;
  }

  /**
   * Extracts a word from the given chunk.
   * @param {string} chunk The chunk to be analyzed. (must be hangul)
   * @returns {string} A word from the given chunk.
   */
  run(chunk) {
    const { scores } = this;
    if (chunk.length === 1) {
      return chunk;
    }
    const subtexts = extractSubtexts(chunk);
    const scoreList = subtexts.map(subtext => [
      subtext,
      (scores.has(subtext) ? scores.get(subtext) : 0),
    ]);
    // scoreList length is always bigger than 1.
    if (scoreList.length >= 2) {
      const candidates = scoreList.filter(([, score], index, array) => {
        const next = index === array.length - 1 ? 1 : array[index + 1][1];
        return score >= next;
      });
      if (candidates.length === 0) {
        return scoreList.map(([subtext, score]) => [
          subtext,
          score + (subtext.length / 10000), // Prevents returning empty string.
        ]).reduce((r, a) => (a[1] > r[1] ? a : r))[0];
      } if (candidates.length === 1) {
        return candidates[0][0];
      }
      return candidates.map(([subtext, score]) => [
        subtext,
        score + (subtext.length / 10000), // Prevents returning empty string.
      ]).reduce((r, a) => (a[1] > r[1] ? a : r))[0];
    }
    return chunk;
  }

  /**
   * Saves words engine instance as a file.
   * @param {string} file Words engine model file path.
   */
  save(file) {
    const {
      frequencies, scores,
    } = this;
    const content = [];
    frequencies.forEach((frequency, text) => {
      content.push([text, frequency, scores.get(text)].join(','));
    });
    fs.writeFileSync(file, content.join('\n'));
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
        subtexts.forEach((subtext) => {
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
    const {
      frequencies, scores,
    } = this;
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

module.exports = SpacingEngine;
