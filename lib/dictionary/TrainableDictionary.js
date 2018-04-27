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

const Dictionary = require('./Dictionary');
const SentenceTokenizer = require('../tokenizer/SentenceTokenizer');

class TrainableDictionary extends Dictionary {
  constructor(words) {
    super(words);
    this.sentenceTokenizer = new SentenceTokenizer();
  }

  train(document) {
    const { sentenceTokenizer } = this;
    const sentences = sentenceTokenizer.run(document);
    // Extract all words and count how many words appear
    const counts = {};
    const hangulRegex = /^[ㄱ-ㅎ가-힣]+$/;
    for (let i = 0, len = sentences.length; i < len; i += 1) {
      const sentence = sentences[i];
      for (let j = 0, len2 = sentence.length; j < len2; j += 1) {
        const chuck = sentence[j];
        if (hangulRegex.test(chuck)) {
          for (let k = 1, len3 = chuck.length; k <= len3; k += 1) {
            const subtext = chuck.slice(0, i);
            if (subtext in counts) {
              counts[subtext] += 1;
            } else {
              counts[subtext] = 1;
            }
          }
        }
      }
    }
    // Calculate cohension n-gram value
    const subtexts = Object.keys(counts);
    const scores = {};
    for (let i = 0, len = subtexts.length; i < len; i += 1) {
      const subtext = subtexts[i];
      scores[subtext] = (counts[subtext] / counts[subtext[0]]) ** (1 / subtext.length); // cohension
    }
  }
}

module.exports = TrainableDictionary;
