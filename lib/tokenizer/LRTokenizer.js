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
 * Class representing LR tokenizer.
 */
class LRTokenizer {
  /**
   * Create LR tokenizer with given dictionary.
   * @param {Dictionary} dictionary
   */
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  /**
   * Split given chuck text into two parts (Left token, Right token).
   * @param {string} text
   * @returns {Array.<string>}
   */
  run(text) {
    const { dictionary } = this;
    const chars = Hangul.disassemble(text);
    const subtexts = [];
    for (let i = 2, len = chars.length; i <= len; i += 1) {
      const subtext = Hangul.assemble(chars.slice(0, i));
      if (dictionary.has(subtext)) {
        subtexts.push([subtext, i]);
      }
    }
    if (subtexts.length > 0) {
      const lastSubtext = subtexts[subtexts.length - 1];
      const leftToken = lastSubtext[0];
      const rightTokenRaw = chars.slice(lastSubtext[1]);
      const rightToken = Hangul.assemble(Hangul.isVowel(rightTokenRaw[0]) ? ['ㅇ', ...rightTokenRaw] : rightTokenRaw);
      return [leftToken, rightToken];
    }
    return [text];
  }
}

module.exports = LRTokenizer;
