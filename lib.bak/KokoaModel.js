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

/**
 * Class representing KokoaNLP Model.
 */
class KokoaModel {
  /**
   * Creates KokoaNLP model instance.
   * @param {Array.<Array.<string|number>>} [originalFrequencies] How many times words appear.
   * @param {Array.<Array.<string|number>>} [originalScores] Words cohension n-gram value.
   * @param {Array.<Array.<string|number>>} [reversedFrequencies]
   *  How many times reversed words appear.
   * @param {Array.<Array.<string|number>>} [reversedScores] Reversed words cohension n-gram value.
   */
  constructor(originalFrequencies, originalScores, reversedFrequencies, reversedScores) {
    this.originalFrequencies = new Map(originalFrequencies);
    this.originalScores = new Map(originalScores);
    this.reversedFrequencies = new Map(reversedFrequencies);
    this.reversedScores = new Map(reversedScores);
  }

  /**
   * Loads KokoaNLP instance from the given model.
   * @param {string} file KokoaNLP model file path.
   * @returns {Kokoa} KokoaNLP instance.
   */
  static loadFile(file) {
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
      return new KokoaModel(
        originalFrequencies,
        originalScores,
        reversedFrequencies,
        reversedScores,
      );
    }
    return null;
  }

  /**
   * Saves KokoaNLP instance as a file.
   * @param {string} file KokoaNLP model file path.
   */
  saveFile(file) {
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
}

module.exports = KokoaModel;
