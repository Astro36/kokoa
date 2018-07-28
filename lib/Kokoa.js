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
const Hanguler = require('hanguler');

const SpacingEngine = require('./core/SpacingEngine');
const WordsEngine = require('./core/WordsEngine');

/**
 * Class representing KokoaNLP.
 */
class Kokoa {
  constructor({ spacingEngine = new SpacingEngine(), wordsEngine = new WordsEngine() } = {}) {
    this.spacingEngine = spacingEngine;
    this.wordsEngine = wordsEngine;
  }

  /**
   * Loads KokoaNLP instance from the given file.
   * @async
   * @param {string} [file='kokoa.all.csv'] KokoaNLP model file path.
   * @returns {Kokoa} KokoaNLP instance.
   */
  static load(file = 'kokoa.all.csv') {
    if (/\.all\.csv$/.test(file) && fs.existsSync(file)) {
      const contents = fs.readFileSync(file).toString();
      const [spacingEngineContent, wordsEngineContent] = contents.split('---');
      const spacingEngine = SpacingEngine.load(spacingEngineContent);
      const wordsEngine = WordsEngine.load(wordsEngineContent);
      return new Kokoa({ spacingEngine, wordsEngine });
    }
    if (/\.\*\.csv$/.test(file)) {
      const spacingFile = file.replace(/\.\*\.csv$/, '.spacing.csv');
      let spacingEngine;
      if (fs.existsSync(spacingFile)) {
        spacingEngine = SpacingEngine.load(fs.readFileSync(spacingFile).toString());
      }
      const wordsFile = file.replace(/\.\*\.csv$/, '.words.csv');
      let wordsEngine;
      if (fs.existsSync(wordsFile)) {
        wordsEngine = WordsEngine.load(fs.readFileSync(wordsFile).toString());
      }
      return new Kokoa({ spacingEngine, wordsEngine });
    }
    return null;
  }

  /**
   * Returns chunks from the given document.
   * @param {string} document The document to extract chunks.
   * @returns {Array.<string>} Chunks of the document.
   */
  chunks(document) {
    const alphabetRegex = /^[A-z]+$/;
    const hangulRegex = /^[가-힣]+$/;
    const numberRegex = /^[0-9]+$/;
    const spaceRegex = /^\S+$/;
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
    return chunks.filter(value => spaceRegex.test(value));
  }

  /**
   * Returns keysentences of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {number} [options.count=5] How many sentences return as keysentences.
   * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [options.minCount=5] Ignores all words with total frequency lower than this.
   * @param {boolean} [options.training=true]
   *  If true, trains KokoaNLP from the given document before the document analyzes.
   * @returns {Array.<string>} keysentences of the document.
   */
  keysentences(document, {
    count = 5, hangulOnly = true, minCount = 10, training = true,
  } = {}) {
    const { wordsEngine } = this;
    const frequencies = new Map();
    const options = { hangulOnly, minCount, training };
    const sentencesRaw = this.sentences(document);
    const sentences = sentencesRaw.map(value => this.words(value, options)).filter(Boolean);
    const words = sentences.reduce((acc, cur) => acc.concat(cur), []);
    words.forEach((value) => {
      if (frequencies.has(value)) {
        frequencies.set(value, frequencies.get(value) + 1);
      } else {
        frequencies.set(value, 1);
      }
    });
    const uniqueWords = Array.from(new Set(words));
    const keywords = new Map(uniqueWords.map(value => [
      value,
      frequencies.get(value) / (1 + Math.log(1 + wordsEngine.getFrequency(value))),
    ]));
    return sentences.map((sentence, index) => [
      index,
      sentence.map(word => keywords.get(word)).reduce((acc, cur) => acc + cur, 0),
    ])
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(value => sentencesRaw[value[0]]);
  }

  /**
   * Returns keywords of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {number} [options.count=10] How many words return as keywords.
   * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [options.minCount=5] Ignores all words with total frequency lower than this.
   * @param {boolean} [options.training=true]
   *  If true, trains KokoaNLP from the given document before the document analyzes.
   * @returns {Array.<string>} Keywords of the document.
   */
  keywords(document, {
    count = 10, hangulOnly = true, minCount = 10, training = true,
  } = {}) {
    const { wordsEngine } = this;
    const frequencies = new Map();
    const words = this.words(document, { hangulOnly, minCount, training });
    words.forEach((value) => {
      if (frequencies.has(value)) {
        frequencies.set(value, frequencies.get(value) + 1);
      } else {
        frequencies.set(value, 1);
      }
    });
    return Array.from(new Set(words))
      .map(value => [
        value,
        frequencies.get(value) / (1 + Math.log(1 + wordsEngine.getFrequency(value))),
      ])
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(value => value[0]);
  }

  /**
  * Returns morphs of the given document.
  * @param {string} document The document to be analyzed.
  * @param {Object} [options] Document analyzer options.
  * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
  * @param {number} [options.minCount=5] Ignores all morphs with total frequency lower than this.
  * @returns {Array.<string>} Morphs of the document.
  */
  morphs(document, { hangulOnly = true, minCount = 10 } = {}) {
    const { wordsEngine } = this;
    const chunks = this.chunks(document);
    const output = [];
    chunks.forEach((chunk) => {
      if (Hanguler.isHangul(chunk)) {
        const word = wordsEngine.run(chunk);
        if (wordsEngine.getFrequency(word[0]) >= minCount) {
          output.push(word[0]);
          if (word[1]) {
            output.push(word[1]);
          }
        }
      } else if (!hangulOnly) {
        output.push(chunk);
      }
    });
    return output;
  }

  /**
   * Saves KokoaNLP instance as a file.
   * @param {string} [file='kokoa.all.csv'] KokoaNLP model file path.
   */
  save(file = 'kokoa.all.csv') {
    if (/\.all\.csv$/.test(file)) {
      const { spacingEngine, wordsEngine } = this;
      fs.writeFileSync(file, [spacingEngine.save(), wordsEngine.save()].join('---'));
    }
    if (/\.\*\.csv$/.test(file)) {
      const { spacingEngine, wordsEngine } = this;
      fs.writeFileSync(file.replace(/\.\*\.csv$/, '.spacing.csv'), spacingEngine.save());
      fs.writeFileSync(file.replace(/\.\*\.csv$/, '.words.csv'), wordsEngine.save());
    }
  }

  /**
   * Returns sentences of the given document.
   * @param {string} document The document to be analyzed.
   * @returns {Array.<string>} Sentences of the document.
   */
  sentences(document) {
    return document.match(/[^.!?…\s][^.!?…]*(?:[.!?…](?!['"]?\s|$)[^.!?…]*)*[.!?…]?['"]?(?=\s|$)/g)
      .map(value => value.split(/\n+/))
      .reduce((accumulator, currentValue) => {
        if (typeof currentValue === 'string') {
          accumulator.push(currentValue);
        } else {
          accumulator.push(...currentValue);
        }
        return accumulator;
      }, [])
      .filter(Boolean);
  }

  /**
   * Returns spaced sentence from the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options] Document analyzer options.
   * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
   * @returns {string} A spaced sentence.
   */
  spacing(document, { hangulOnly = true } = {}) {
    const { spacingEngine } = this;
    const input = document.replace(/[^가-힣]|\s/g, '');
    let output = input[0] + input[1];
    for (let i = 0, len = input.length - 2; i < len; i += 1) {
      const quodgram = input.slice(i, i + 3);
      const p = spacingEngine.run(quodgram);
      if (p >= 0.7) {
        output += ` ${quodgram[2]}`;
      } else {
        output += quodgram[2];
      }
    }
    if (!hangulOnly) {
      // will be added.
    }
    return output;
  }

  /**
   * Trains the given document.
   * @param {string} document The document to be trained.
   */
  train(document) {
    const { spacingEngine, wordsEngine } = this;
    const chunks = this.chunks(document).filter(Hanguler.isHangul);
    spacingEngine.train(chunks);
    wordsEngine.train(chunks);
  }

  /** Updates calculated value for each data. */
  update() {
    const { spacingEngine, wordsEngine } = this;
    spacingEngine.update();
    wordsEngine.update();
  }

  /**
   * Returns words of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options] Document analyzer options.
   * @param {boolean} [options.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [options.minCount=5] Ignores all words with total frequency lower than this.
   * @param {boolean} [options.training=true]
   *  If true, trains KokoaNLP from the given document before the document analyzes.
   * @returns {Array.<string>} Words of the document.
   */
  words(document, { hangulOnly = true, minCount = 10, training = true } = {}) {
    const { wordsEngine } = this;
    const chunks = this.chunks(document);
    if (training) {
      wordsEngine.train(chunks.filter(Hanguler.isHangul));
      wordsEngine.update();
    }
    const output = [];
    chunks.forEach((chunk) => {
      if (Hanguler.isHangul(chunk)) {
        const word = wordsEngine.run(chunk)[0];
        if (wordsEngine.getFrequency(word) >= minCount) {
          output.push(word);
        }
      } else if (!hangulOnly) {
        output.push(chunk);
      }
    });
    return output;
  }
}

module.exports = Kokoa;
