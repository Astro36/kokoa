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

/* eslint class-methods-use-this: "off" */

/**
 * Class representing sentence tokenizer.
 */
class SentenceTokenizer {
  /**
   * Split the sentences into each chucks.
   * @param {string} text
   * @returns {Array.<Array.<string>>}
   */
  run(text) {
    /** @see {@link https://github.com/open-korean-text/open-korean-text/blob/master/src/main/scala/org/openkoreantext/processor/tokenizer/KoreanSentenceSplitter.scala|GitHub} */
    return text.match(/[^.!?…\s][^.!?…]*(?:[.!?…](?!['"]?\s|$)[^.!?…]*)*[.!?…]?['"]?(?=\s|$)/g)
      .map(value => value.replace(/([^ㄱ-ㅎ가-힣]+)/g, ' $1 ').split(/\s+/));
  }
}

module.exports = SentenceTokenizer;
