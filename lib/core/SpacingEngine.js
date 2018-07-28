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
   * Creates spacing engine instance.
   * @param {Object} [model] Words spacing model.
   * @param {Array.<Array.<string|number>>} [model.trigramFrequencies]
   *  How many times trigrams appear.
   * @param {Array.<Array.<string|number>>} [model.spacingFrequencies] How many times spaces appear.
   * @param {Array.<Array.<string|number>>} [model.scores] trigram spacing probabiltiy.
   */
  constructor({ trigramFrequencies, spacingFrequencies, scores } = {}) {
    super();
    this.trigramFrequencies = new Map(trigramFrequencies);
    this.spacingFrequencies = new Map(spacingFrequencies);
    this.scores = new Map(scores);
  }

  /**
   * Loads spacing engine instance from the given string.
   * @param {string} content Spacing engine model content.
   * @returns {SpacingEngine} Spacing engine instance.
   */
  static load(content) {
    const trigramFrequencies = [];
    const spacingFrequencies = [];
    const scores = [];
    content.split('\n').forEach((value) => {
      const [text, trigramFrequency, spacingFrequency, score] = value.split(',');
      trigramFrequencies.push([text, Number(trigramFrequency)]);
      spacingFrequencies.push([text, Number(spacingFrequency)]);
      scores.push([text, Number(score)]);
    });
    return new SpacingEngine({ trigramFrequencies, spacingFrequencies, scores });
  }

  /**
   * Returns spacing probabiltiy of the given trigram.
   * @param {string} trigram The trigram to be analyzed. (must be hangul and four characters)
   * @returns {number} A spacing probabiltiy of the given trigram.
   */
  run(trigram) {
    const { scores } = this;
    return scores.has(trigram) ? scores.get(trigram) : 0;
  }

  /**
   * Returns spacing engine instance as a string.
   * @returns {string} spacing engine model content.
   */
  save() {
    const { trigramFrequencies, spacingFrequencies, scores } = this;
    const content = [];
    trigramFrequencies.forEach((frequency, text) => {
      content.push([text, frequency, spacingFrequencies.get(text) || 0, scores.get(text)].join(','));
    });
    return content.join('\n');
  }

  /**
   * Trains the given chunks.
   * @param {Array.<string>} chunks The chunks to be trained. (must be hangul)
   */
  train(chunks) {
    const { trigramFrequencies, spacingFrequencies } = this;
    // Extract all trigram and count how many trigrams appear.
    const sentence = `  ${chunks.join('')} `; // No spaced sentence
    for (let i = 0, len = sentence.length - 2; i < len; i += 1) {
      const trigram = sentence.slice(i, i + 3);
      if (trigramFrequencies.has(trigram)) {
        trigramFrequencies.set(trigram, trigramFrequencies.get(trigram) + 1);
      } else {
        trigramFrequencies.set(trigram, 1);
      }
    }
    // Count how many spacing trigrams(AABA) appear.
    chunks.forEach((chunk, index, array) => {
      const len = chunk.length;
      // center
      if (index < array.length - 1) {
        let leftBigram = chunk.slice(len - 2, len + 1);
        const rightUnigram = array[index + 1][0];
        if (leftBigram.length < 2) {
          if (index === 0) {
            leftBigram = ` ${leftBigram}`;
          } else {
            const previousChunk = array[index - 1];
            leftBigram = previousChunk[previousChunk.length - 1] + leftBigram;
          }
        }
        const spacedtrigram = leftBigram + rightUnigram;
        if (spacingFrequencies.has(spacedtrigram)) {
          spacingFrequencies.set(spacedtrigram, spacingFrequencies.get(spacedtrigram) + 1);
        } else {
          spacingFrequencies.set(spacedtrigram, 1);
        }
      }
    });
  }

  /** Updates calculated spacing probability trigram value for each word. */
  update() {
    const { trigramFrequencies, spacingFrequencies, scores } = this;
    spacingFrequencies.forEach((frequency, trigram) => {
      scores.set(trigram, frequency / trigramFrequencies.get(trigram));
    });
  }
}

module.exports = SpacingEngine;
