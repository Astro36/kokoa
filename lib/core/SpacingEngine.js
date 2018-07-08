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

/**
 * Class representing a sentence spacing engine.
 * @extends Engine
 */
class SpacingEngine extends Engine {
  /**
   * Creates spacing engine instance.
   * @param {Object} [model] Words spacing model.
   * @param {Array.<Array.<string|number>>} [model.bigramFrequencies] How many times bigrams appear.
   * @param {Array.<Array.<string|number>>} [model.spacingFrequencies] How many times spaces appear.
   * @param {Array.<Array.<string|number>>} [model.scores] Bigram spacing probabiltiy.
   */
  constructor({ bigramFrequencies, spacingFrequencies, scores } = {}) {
    super();
    this.bigramFrequencies = new Map(bigramFrequencies);
    this.spacingFrequencies = new Map(spacingFrequencies);
    this.scores = new Map(scores);
  }

  /**
   * Loads spacing engine instance from the given file.
   * @param {string} file Spacing engine model file path.
   * @returns {SpacingEngine} Spacing engine instance.
   */
  static load(file) {
    if (fs.existsSync(file)) {
      const bigramFrequencies = [];
      const spacingFrequencies = [];
      const scores = [];
      fs.readFileSync(file).toString().split('\n').forEach((value) => {
        const [text, bigramFrequency, spacingFrequency, score] = value.split(',');
        bigramFrequencies.push([text, Number(bigramFrequency)]);
        spacingFrequencies.push([text, Number(spacingFrequency)]);
        scores.push([text, Number(score)]);
      });
      return new SpacingEngine({ bigramFrequencies, spacingFrequencies, scores });
    }
    return null;
  }

  /**
   * Returns spacing probabiltiy of the given bigram.
   * @param {string} bigram The bigram to be analyzed. (must be hangul)
   * @returns {number} A spacing probabiltiy of the given bigram.
   */
  run(bigram) {
    const { scores } = this;
    return scores.has(bigram) ? scores.get(bigram) : 0;
  }

  /**
   * Saves spacing engine instance as a file.
   * @param {string} file Spacing engine model file path.
   */
  save(file) {
    const { bigramFrequencies, spacingFrequencies, scores } = this;
    const content = [];
    bigramFrequencies.forEach((frequency, text) => {
      content.push([text, frequency, spacingFrequencies.get(text) || 0, scores.get(text)].join(','));
    });
    fs.writeFileSync(file, content.join('\n'));
  }

  /**
   * Trains the given chunks.
   * @param {Array.<string>} chunks The chunks to be trained. (must be hangul)
   */
  train(chunks) {
    const { bigramFrequencies, spacingFrequencies } = this;
    // Extract all words and count how many words appear.
    const sentence = chunks.join(''); // No spaced
    for (let i = 0, len = sentence.length - 1; i < len; i += 1) {
      const bigram = sentence.slice(i, i + 2);
      if (bigramFrequencies.has(bigram)) {
        bigramFrequencies.set(bigram, bigramFrequencies.get(bigram) + 1);
      } else {
        bigramFrequencies.set(bigram, 1);
      }
    }
    chunks.forEach((chunk, index, array) => {
      if (index < array.length - 1) {
        const len = chunk.length;
        const spacedNgram = chunk[len - 1] + array[index + 1][0];
        if (spacingFrequencies.has(spacedNgram)) {
          spacingFrequencies.set(spacedNgram, spacingFrequencies.get(spacedNgram) + 1);
        } else {
          spacingFrequencies.set(spacedNgram, 1);
        }
      }
    });
  }

  /** Updates calculated cohension n-gram value for each word. */
  update() {
    const { bigramFrequencies, spacingFrequencies, scores } = this;
    spacingFrequencies.forEach((frequency, bigram) => {
      scores.set(bigram, frequency / bigramFrequencies.get(bigram));
    });
  }
}

module.exports = SpacingEngine;
