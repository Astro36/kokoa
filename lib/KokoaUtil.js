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

/* eslint class-methods-use-this: off */

const Kokoa = require('./Kokoa');

const size = object => object.length;
const f = (term, document) => size(document.filter(value => term === value));
const tf = (term, document) => f(term, document) / size(document);
const idf = (term, documents) => Math.log(size(documents)
  / (1 + size(documents.filter(document => document.some(value => term === value)))));
const tfidf = (term, document, documents) => tf(term, document) * idf(term, documents);

/**
 * Class representing KokoaNLP Util.
 */
class KokoaUtil {
  constructor(kokoa = new Kokoa()) {
    this.kokoa = kokoa;
  }

  engine() {
    return this.kokoa;
  }

  /**
   * Returns keysentences of the given document.
   * @param {string} document The document to be analyzed.
   * @param {Object} [options]
   * @param {number} [options.count=10] How many words return as keysentences.
   * @param {number} [options.threshold=0.5] Ignores all words with total frequency lower than this.
   * @param {boolean} [options.training=true] If true, trains KokoaNLP before the document analyzes.
   * @param {Object} [trainingOptions]
   * @param {boolean} [trainingOptions.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [trainingOptions.threshold=5] Ignores all words with total frequency lower than this.
   * @returns {Array.<string>} Keywords of the document.
   */
  keysentences(document, { count = 5, threshold = 0.8, training = true } = {}, trainingOptions) {
    const { kokoa } = this;
    if (training) {
      kokoa.train(document, trainingOptions);
      kokoa.update();
    }
    const sentencesRaw = this.sentences(document);
    const sentences = sentencesRaw.map(value => kokoa.run(value)).filter(Boolean);
    return sentences.map((sentence, index) => [
      index,
      sentence.map(word => (tfidf(word, sentence, sentences) > threshold ? 1 : 0))
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0),
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
   * @param {Object} [trainingOptions]
   * @param {boolean} [trainingOptions.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [trainingOptions.threshold=5] Ignores all words with total frequency lower than this.
   * @returns {Array.<string>} Keywords of the document.
   */
  keywords(document, { count = 5, training = true } = {}, trainingOptions) {
    const { kokoa } = this;
    if (training) {
      kokoa.train(document, trainingOptions);
      kokoa.update();
    }
    const sentences = this.sentences(document).map(value => kokoa.run(value));
    const words = [];
    sentences.forEach((sentence) => {
      sentence.forEach(word => words.push([word, tfidf(word, sentence, sentences)]));
    });
    return words.sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(value => value[0]);
  }

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
   * @param {Object} [trainingOptions]
   * @param {boolean} [trainingOptions.hangulOnly=true] If true, only returns hangul contents.
   * @param {number} [trainingOptions.threshold=5] Ignores all words with total frequency lower than this.
   * @returns {Array.<string>} Words of the document.
   */
  words(document, { training = true } = {}, trainingOptions) {
    const { kokoa } = this;
    if (training) {
      kokoa.train(document, trainingOptions);
      kokoa.update();
    }
    return kokoa.run(document, trainingOptions);
  }
}

module.exports = KokoaUtil;
