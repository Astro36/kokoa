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

/* eslint class-methods-use-this: off */

const Kokoa = require('./Kokoa');

/**
 * Class representing KokoaNLP Util.
 */
class KokoaUtil {
  constructor(kokoa = new Kokoa()) {
    this.kokoa = kokoa;
  }

  /**
   * Returns KokoaNLP instance.
   * @returns {Kokoa} KokoaNLP instance
   */
  engine() {
    return this.kokoa;
  }

  /**
   * Returns keysentences of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {number} [options.count=10] How many words return as keysentences.
   * @param {boolean} [options.training=true] If true, trains KokoaNLP before the document analyzes.
   * @param {KokoaOptions} [kokoaOptions] Document analyzer options
   * @returns {Array.<string>} Keywords of the document.
   */
  keysentences(document, { count = 5, training = true } = {}, kokoaOptions) {
    const { kokoa } = this;
    if (training) {
      kokoa.train(document);
      kokoa.update();
    }
    const frequencies = new Map();
    const sentencesRaw = this.sentences(document);
    const sentences = sentencesRaw.map(value => kokoa.run(value, kokoaOptions)).filter(Boolean);
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
      frequencies.get(value) / (1 + Math.log(1 + kokoa.getFrequency(value))),
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
   * @param {number} [options.count=10] How many words return as keysentences.
   * @param {boolean} [options.training=true] If true, trains KokoaNLP before the document analyzes.
   * @param {KokoaOptions} [kokoaOptions] Document analyzer options
   * @returns {Array.<string>} Keywords of the document.
   */
  keywords(document, { count = 10, training = true } = {}, kokoaOptions) {
    const { kokoa } = this;
    if (training) {
      kokoa.train(document);
      kokoa.update();
    }
    const frequencies = new Map();
    const words = kokoa.run(document, kokoaOptions);
    words.forEach((value) => {
      if (frequencies.has(value)) {
        frequencies.set(value, frequencies.get(value) + 1);
      } else {
        frequencies.set(value, 1);
      }
    });
    return Array.from(new Set(words))
      .map(value => [value, frequencies.get(value) / (1 + Math.log(1 + kokoa.getFrequency(value)))])
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(value => value[0]);
  }

  /**
   * Returns sentences of the given documents.
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
   * Returns words of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {boolean} [options.training=true] If true, trains KokoaNLP before the document analyzes.
   * @param {KokoaOptions} [kokoaOptions] Document analyzer options
   * @returns {Array.<string>} Words of the document.
   */
  words(document, { training = true } = {}, kokoaOptions) {
    const { kokoa } = this;
    if (training) {
      kokoa.train(document);
      kokoa.update();
    }
    return kokoa.run(document, kokoaOptions);
  }
}

module.exports = KokoaUtil;
