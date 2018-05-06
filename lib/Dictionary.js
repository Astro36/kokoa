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

/**
 * Class representing the dictionary.
 */
class Dictionary {
  /**
   * Create a dictionary with the given words.
   * @param {Object.<string, Array.<string>>} words
   */
  constructor(words) {
    this.words = words;
  }

  /**
   * Check if the dictionary has given word.
   * @param {string} word
   * @returns {boolean}
   */
  has(text) {
    return text in this.words;
  }

  /**
   * Returns a JSON string of the dictionary.
   * @returns {string}
   */
  toJSON() {
    return this.words;
  }
}

module.exports = Dictionary;
