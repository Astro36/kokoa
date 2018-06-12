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

const Kokoa = require('./Kokoa');

/**
 * Class representing KokoaNLP Model.
 */
class KokoaModel {
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
      fs.readFileSync(file).toString().split('\n').forEach((value) => {
        const [type, text, frequency, score] = value.split(',');
        if (type === 'O') {
          originalFrequencies.push([text, Number(frequency)]);
          originalScores.push([text, Number(score)]);
        } else {
          reversedFrequencies.push([text, Number(frequency)]);
          reversedScores.push([text, Number(score)]);
        }
      });
      return new Kokoa(originalFrequencies, reversedFrequencies, originalScores, reversedScores);
    }
    return null;
  }

  /**
   * Saves KokoaNLP instance as a file.
   * @param {Kokoa} kokoa KokoaNLP instance
   * @param {string} file KokoaNLP model file path.
   */
  static saveFile(kokoa, file) {
    const {
      originalFrequencies, originalScores, reversedFrequencies, reversedScores,
    } = kokoa;
    const content = [];
    originalFrequencies.forEach((frequency, text) => {
      content.push(['O', text, frequency, originalScores.get(text)].join(','));
    });
    reversedFrequencies.forEach((frequency, text) => {
      content.push(['R', text, frequency, reversedScores.get(text)].join(','));
    });
    fs.writeFileSync(file, content.join('\n'));
  }
}

module.exports = KokoaModel;
