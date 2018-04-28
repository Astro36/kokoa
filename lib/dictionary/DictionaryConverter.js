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

const fs = require('fs');
const os = require('os');

const extractFromWordArray = (wordArr, pos) => {
  const hangulRegex = /^[ㄱ-ㅎ가-힣]+$/;
  const words = {};
  for (let i = 0, len = wordArr.length; i < len; i += 1) {
    const word = wordArr[i];
    if (hangulRegex.test(word)) {
      if (word in words) {
        const wordPOS = words[word];
        wordPOS.push(pos);
        words[word] = [new Set(wordPOS)];
      } else {
        words[word] = pos;
      }
    }
  }
  return words;
};

const extractFromFilePath = (filePath, pos, separator) => {
  if (filePath.endsWith('.json')) {
    return extractFromWordArray(JSON.parse(fs.readFileSync(filePath)), pos);
  } else if (filePath.endsWith('.txt')) {
    return extractFromWordArray(fs.readFileSync(filePath).toString().split(separator), pos);
  }
  return null;
};

const extractFromDirPath = (dirPath, pos, separator) => {
  const filePaths = fs.readdirSync(dirPath);
  const allWords = {};
  for (let i = 0, len = filePaths.length; i < len; i += 1) {
    const filePath = filePaths[i];
    const wordArr = extractFromFilePath(filePath, pos, separator);
    if (wordArr) {
      const words = Object.entries(wordArr);
      for (let j = 0, len2 = words.length; j < len2; j += 1) {
        const [word, pos2] = words[j];
        if (word in allWords) {
          const wordPOS = allWords[word];
          wordPOS.push(pos2);
          allWords[word] = [new Set(wordPOS)];
        } else {
          allWords[word] = pos2;
        }
      }
    }
  }
  return allWords;
};

/**
 * Class representing dictionary converter.
 */
class DictionaryConverter {
  /**
   * Extract words for using a dictionary from given data.
   * @param {(Array.<string>|string)} arg Trained words or word file path
   * @param {Array.<string>} pos
   * @param {string} [separator=EOL]
   * @returns {Object.<string, Array.<string>>}
   */
  static extractFrom(arg, pos, separator = os.EOL) {
    if (typeof arg === 'string') {
      if (fs.existsSync(arg)) {
        const stats = fs.lstatSync(arg);
        if (stats.isDirectory()) {
          return extractFromDirPath(arg, pos, separator);
        }
        return extractFromFilePath(arg, pos, separator);
      }
    } else if (Array.isArray(arg)) {
      return extractFromWordArray(arg, pos);
    }
    return {};
  }
}

module.exports = DictionaryConverter;
