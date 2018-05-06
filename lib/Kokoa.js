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
 * Extract chunks from the given document.
 * @param {string} document
 * @returns {Array.<string>}
 */
const extractChunks = (document) => {
  const alphabetRegex = /^[A-z]+$/;
  const hangulRegex = /^[가-힣]+$/;
  const numberRegex = /^[0-9]+$/;
  const chunks = [];
  document.split('').forEach((char) => {
    const previousChunk = chunks[chunks.length - 1] || '';
    if ((alphabetRegex.test(previousChunk) && alphabetRegex.test(char)) // if char is alphabet
      || (hangulRegex.test(previousChunk) && hangulRegex.test(char)) // if char is hangul
      || (numberRegex.test(previousChunk) && numberRegex.test(char)) // if char is number
      || (previousChunk[previousChunk.length - 1] === char)) { // if char is repeated
      chunks[chunks.length - 1] += char;
    } else {
      chunks.push(char);
    }
  });
  return chunks;
};

/**
 * Class representing KokoaNLP.
 */
class Kokoa {
  /**
   * Create KokoaNLP with the given dictionary.
   * @param {Dictionary} dictionary
   */
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  /**
   * Analyze the given document.
   * @param {string} document
   * @returns {Array.<string>}
   */
  run(document) {
    const { dictionary } = this;
    const hangulRegex = /^[가-힣]+$/;
    const chunks = extractChunks(document);
    const words = [];
    chunks.forEach((chunk) => {
      if (hangulRegex.test(chunk)) {
        const tokenize = (text) => {
          // Create tokens candidates.
          const chars = Hangul.disassemble(text);
          const subtexts = [];
          for (let i = 2, len = chars.length; i <= len; i += 1) {
            const subtext = Hangul.assemble(chars.slice(0, i));
            subtexts.push([subtext, i]);
          }
          // Supervised LR Tokenizer
          for (let i = subtexts.length - 1; i >= 0; i -= 1) {
            const [leftToken, len] = subtexts[i];
            if (dictionary.has(leftToken)) {
              const rightTokenRaw = chars.slice(len);
              const rightToken = Hangul.assemble(Hangul.isVowel(rightTokenRaw[0]) ? ['ㅇ', ...rightTokenRaw] : rightTokenRaw);
              words.push(leftToken);
              if (rightToken) {
                tokenize(rightToken);
              }
              return;
            }
          }
          // Un-supervised LR Tokenizer
          if (text.length > 1) {
            const counts = {};
            for (let i = subtexts.length - 1; i >= 0; i -= 1) {
              const [subtext, len] = subtexts[i];
              counts[subtext] = [chunks.filter(value => value.indexOf(subtext) === 0).length, len];
            }
            const maxFreq = Object.values(counts).sort((a, b) => b[1][0] - a[1][0])[0][0];
            const [leftToken, data] = Object.entries(counts).find(value => value[1][0] === maxFreq);
            const rightTokenRaw = chars.slice(data[1]);
            const rightToken = Hangul.assemble(Hangul.isVowel(rightTokenRaw[0]) ? ['ㅇ', ...rightTokenRaw] : rightTokenRaw);
            words.push(leftToken);
            if (rightToken) {
              tokenize(rightToken);
            }
            return;
          }
          words.push(text);
        };
        tokenize(chunk);
      } else {
        words.push(chunk);
      }
    });
    return words;
  }
}

module.exports = Kokoa;
