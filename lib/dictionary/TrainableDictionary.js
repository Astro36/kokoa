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

const Dictionary = require('./Dictionary');
const SentenceTokenizer = require('../tokenizer/SentenceTokenizer');

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatten|MDN}
 * @param {Array} arr
 * @returns {Array}
 */
const flatten = arr => arr.reduce((acc, val) => acc.concat(val), []);

/**
 * Class representing trainable dictionary.
 * @extends Dictionary
 */
class TrainableDictionary extends Dictionary {
  /**
   * Create trainable dictionary with given words.
   * @param {Object.<string, Array.<string>>} [words={}]
   */
  constructor(words) {
    super(words);
    this.sentenceTokenizer = new SentenceTokenizer();
  }

  /**
   * Train the new words with given documents.
   * @param {string} document
   */
  train(document) {
    const { sentenceTokenizer, words } = this;
    const hangulRegex = /^[ㄱ-ㅎ가-힣]+$/;
    const chucks = flatten(sentenceTokenizer.run(document))
      .filter(value => hangulRegex.test(value))
      .map((chuck) => {
        const subtexts = [];
        const chars = Hangul.disassemble(chuck);
        for (let i = 1, len = chars.length; i <= len; i += 1) {
          const subtext = Hangul.assemble(chars.slice(0, i));
          if (!Hangul.isConsonant(subtext[subtext.length - 1])) {
            subtexts.push(subtext);
          }
        }
        return subtexts;
      });
    // Extract all words and count how many words appear.
    const counts = {};
    for (let i = 0, len = chucks.length; i < len; i += 1) {
      const subtexts = chucks[i];
      for (let j = 0, len2 = subtexts.length; j < len2; j += 1) {
        const subtext = subtexts[j];
        if (subtext in counts) {
          counts[subtext] += 1;
        } else {
          counts[subtext] = 1;
        }
      }
    }
    // Calculate cohension n-gram value.
    const uniqueSubtexts = Object.keys(counts);
    const cohensions = {};
    for (let i = 0, len = uniqueSubtexts.length; i < len; i += 1) {
      const subtext = uniqueSubtexts[i];
      if (subtext.length === 1) {
        cohensions[subtext] = 0.1;
      } else {
        const exp = 1 / Hangul.disassemble(subtext).length;
        cohensions[subtext] = (counts[subtext] / counts[subtext[0]]) ** exp;
      }
    }
    // Train new words.
    for (let i = 0, len = chucks.length; i < len; i += 1) {
      const subtexts = chucks[i];
      let word = null;
      let score = 0;
      for (let j = 0, len2 = subtexts.length; j < len2; j += 1) {
        const subtext = subtexts[j];
        const subtextCohension = cohensions[subtext];
        if (subtextCohension >= score) {
          word = subtext;
          score = subtextCohension;
        } else {
          break;
        }
      }
      if (!(word in words) && word.length > 1) {
        words[word] = ['미지정'];
      }
    }
  }
}

module.exports = TrainableDictionary;
