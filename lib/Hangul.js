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

const CONSONANTS = ['ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const VOWELS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];

const CHOSEONGS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSEONGS = VOWELS;
const JONGSEONGS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const COMPLEX_CONSONANTS = new Map([
  ['ㄳ', ['ㄱ', 'ㅅ']],
  ['ㄵ', ['ㄴ', 'ㅈ']],
  ['ㄺ', ['ㄹ', 'ㄱ']],
  ['ㄻ', ['ㄹ', 'ㅁ']],
  ['ㄼ', ['ㄹ', 'ㅂ']],
  ['ㄽ', ['ㄹ', 'ㅅ']],
  ['ㄾ', ['ㄹ', 'ㅌ']],
  ['ㄿ', ['ㄹ', 'ㅍ']],
  ['ㅀ', ['ㄹ', 'ㅎ']],
  ['ㅄ', ['ㅂ', 'ㅅ']],
]);
const COMPLEX_VOWELS = new Map([
  ['ㅘ', ['ㅗ', 'ㅏ']],
  ['ㅙ', ['ㅗ', 'ㅐ']],
  ['ㅚ', ['ㅗ', 'ㅣ']],
  ['ㅝ', ['ㅜ', 'ㅓ']],
  ['ㅞ', ['ㅜ', 'ㅔ']],
  ['ㅟ', ['ㅜ', 'ㅣ']],
  ['ㅢ', ['ㅡ', 'ㅣ']],
]);

const hangulRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣ]+$/;
const hangulCompleteRegex = /^[가-힣]+$/;

/**
 * str이 한글 자음인지 확인합니다.
 * @example
 * Hangul.isConsonant('ㄱ'); // true
 * Hangul.isConsonant('ㅏ'); // false
 * Hangul.isConsonant('a'); // false
 * @param {string} str
 * @returns {boolean}
 */
const isConsonant = str => CONSONANTS.includes(str);

/**
 * str이 한글 모음인지 확인합니다.
 * @example
 * Hangul.isVowel('ㄱ'); // false
 * Hangul.isVowel('ㅏ'); // true
 * Hangul.isVowel('a'); // false
 * @param {string} str
 * @returns {boolean}
 */
const isVowel = str => VOWELS.includes(str);

/**
 * str이 한글 초성으로 사용될 수 있는지 확인합니다.
 * @example
 * Hangul.isChoseong('ㄱ'); // true
 * Hangul.isChoseong('ㄳ'); // false
 * Hangul.isChoseong('ㅏ'); // false
 * Hangul.isChoseong('a'); // false
 * @param {string} str
 * @returns {boolean}
 */
const isChoseong = str => CHOSEONGS.includes(str);

/**
 * str이 한글 중성으로 사용될 수 있는지 확인합니다.
 * @example
 * Hangul.isJungseong('ㄱ'); // false
 * Hangul.isJungseong('ㄳ'); // false
 * Hangul.isJungseong('ㅏ'); // true
 * Hangul.isJungseong('a'); // false
 * @param {string} str
 * @returns {boolean}
 */
const isJungseong = str => JUNGSEONGS.includes(str);

/**
 * str이 한글 종성으로 사용될 수 있는지 확인합니다.
 * @example
 * Hangul.isJongseong('ㄱ'); // true
 * Hangul.isJongseong('ㄳ'); // true
 * Hangul.isJongseong('ㅏ'); // false
 * Hangul.isJongseong('a'); // false
 * @param {string} str
 * @returns {boolean}
 */
const isJongseong = str => JONGSEONGS.includes(str);

/**
 * str이 한글인지 확인합니다.
 * @example
 * Hangul.isHangul('ㄱ'); // true
 * Hangul.isHangul('ㅏ'); // true
 * Hangul.isHangul('가'); // true
 * Hangul.isHangul('a'); // false
 * @param {string} str
 * @returns {boolean}
 */
const isHangul = str => hangulRegex.test(str);

/**
 * str이 완전한 한글인지 확인합니다.
 * @example
 * Hangul.isHangulComplete('ㄱ'); // false
 * Hangul.isHangulComplete('ㅏ'); // false
 * Hangul.isHangulComplete('가'); // true
 * Hangul.isHangulComplete('a'); // false
 * @param {string} str
 * @returns {boolean}
 */
const isHangulComplete = str => hangulCompleteRegex.test(str);

const flatten = arr => arr.reduce((acc, cur) => acc.concat(cur), []);

/**
 * 음운을 조합하여 반환합니다.
 * @example
 * Hangul.assemble([
 *   ['ㅂ', 'ㅣ'],
 *   ['ㄷ', 'ㅜ', 'ㄹ'],
 *   ['ㄱ', 'ㅣ'],
 *   ['ㅇ', 'ㅑ'],
 *   ' ',
 *   ['ㅁ', 'ㅓ', 'ㄱ'],
 *   ['ㅈ', 'ㅏ'],
 *   '9',
 *   '9',
 *   '9'
 * ]); // '비둘기야 먹자999'
 * @param {Array.<(Array.<string>|string)>} arr
 * @returns {string}
 */
const assemble = arr => arr.map((syllables) => {
  if (Array.isArray(syllables)) {
    const cho = CHOSEONGS.indexOf(syllables[0]);
    const jung = JUNGSEONGS.indexOf(syllables[1]);
    const jong = Math.max(JONGSEONGS.indexOf(syllables[2]), 0);
    return String.fromCharCode(44032 + (cho * 588) + (jung * 28) + jong);
  }
  return syllables;
}).join('');

/**
 * 음절을 분해하여 반환합니다.
 * @example
 * Hangul.disassemble('빵상 깨랑까랑');
 * // [
 * //  ['ㅃ', 'ㅏ', 'ㅇ'],
 * //  ['ㅅ', 'ㅏ', 'ㅇ'],
 * //  ' ',
 * //  ['ㄲ', 'ㅐ'],
 * //  ['ㄹ', 'ㅏ', 'ㅇ'],
 * //  ['ㄲ', 'ㅏ'],
 * //  ['ㄹ', 'ㅏ', 'ㅇ']
 * // ]
 * @param {string} str
 * @param {boolean} [deepDisassem=true]
 * @returns {Array.<(Array.<string>|string)>}
 */
const disassemble = (str, deepDisassem = true) => {
  const output = [];
  for (let i = 0, len = str.length; i < len; i += 1) {
    const char = str[i];
    if (isHangulComplete(char)) {
      const code = char.charCodeAt(0) - 44032;
      const cho = CHOSEONGS[Math.floor(Math.floor(code / 28) / 21)];
      const jung = JUNGSEONGS[Math.floor(code / 28) % 21];
      const jong = JONGSEONGS[code % 28];
      if (jong) {
        if (deepDisassem) {
          output.push(flatten([
            cho,
            COMPLEX_VOWELS.has(jung) ? COMPLEX_VOWELS.get(jung) : jung,
            COMPLEX_CONSONANTS.has(jong) ? COMPLEX_CONSONANTS.get(jong) : jong,
          ]));
        } else {
          output.push([cho, jung, jong]);
        }
      } else if (deepDisassem) {
        output.push(flatten([
          cho,
          COMPLEX_VOWELS.has(jung) ? COMPLEX_VOWELS.get(jung) : jung,
        ]));
      } else {
        output.push([cho, jung]);
      }
    } else {
      output.push(char);
    }
  }
  return output;
};

/**
 * 음운을 조합하여 반환합니다.
 * @example
 * Hangul.flatAssemble([
 *   'ㅁ', 'ㅏ', 'ㅂ', 'ㅓ', 'ㅂ', 'ㅇ', 'ㅡ', 'ㅣ' ,' ',
 *   'ㅅ', 'ㅗ', 'ㄹ', 'ㅏ', 'ㄱ', 'ㅗ', 'ㄷ', 'ㅗ', 'ㅇ'
 * ]); // '마법의 소라고동'
 * @param {Array.<string>} arr
 * @returns {string}
 */
const flatAssemble = (arr) => {
  const consonants = Array.from(COMPLEX_CONSONANTS.entries());
  const vowels = Array.from(COMPLEX_VOWELS.entries());
  const str = arr.map((current, index, array) => {
    const previous = array[index - 1];
    const next = array[index + 1];
    if (isConsonant(previous) && isConsonant(current) && (isConsonant(next) || !next)) {
      const consonant = consonants
        .find(([, syllables]) => syllables[0] === previous && syllables[1] === current);
      if (consonant) {
        return consonant[0];
      }
    } else if (isVowel(previous) && isVowel(current)) {
      const vowel = vowels
        .find(([, syllables]) => syllables[0] === previous && syllables[1] === current);
      if (vowel) {
        return vowel[0];
      }
    }
    return current;
  }).filter((current, index, array) => {
    const next = array[index + 1];
    return !COMPLEX_CONSONANTS.has(next) && !COMPLEX_VOWELS.has(next);
  }).reduce((accumulator, current, index, array) => {
    if (isHangul(current)) {
      const previous = array[index - 1];
      const next = array[index + 1];
      const next2 = array[index + 2];
      if (isConsonant(previous) && isVowel(current)) {
        if ((isConsonant(next) && isConsonant(next2)) ||
          (isConsonant(next) && !next2)
        ) {
          accumulator.push([previous, current, next]);
        } else {
          accumulator.push([previous, current]);
        }
      } else if ((isConsonant(previous) && isConsonant(current) && (isConsonant(next) || !next)) ||
        (isVowel(previous) && isVowel(current) && (isVowel(next) || !next))) {
        accumulator.push(current);
      }
    } else {
      accumulator.push(current);
    }
    return accumulator;
  }, []);
  return assemble(str);
};

/**
 * 음절을 분해하여 반환합니다.
 * @example
 * Hangul.flatDisassemble('너 때문에 흥이 다 깨져버렸으니까 책임져');
 * // [
 * //  'ㄴ', 'ㅓ', ' ', 'ㄸ', 'ㅐ', 'ㅁ', 'ㅜ', 'ㄴ', 'ㅇ', 'ㅔ', ' ',
 * //  'ㅎ', 'ㅡ', 'ㅇ', 'ㅇ', 'ㅣ', ' ', 'ㄷ', 'ㅏ', ' ',
 * //  'ㄲ', 'ㅐ', 'ㅈ', 'ㅕ', 'ㅂ', 'ㅓ', 'ㄹ', 'ㅕ', 'ㅆ', 'ㅇ', 'ㅡ', 'ㄴ', 'ㅣ', 'ㄲ', 'ㅏ', ' ',
 * //  'ㅊ', 'ㅐ', 'ㄱ', 'ㅇ', 'ㅣ', 'ㅁ', 'ㅈ', 'ㅕ'
 * // ]
 * @param {string} str
 * @param {boolean} [deepDisassem=true]
 * @returns {Array.<string>}
 */
const flatDisassemble = (str, deepDisassem) => flatten(disassemble(str, deepDisassem));

/**
 * str이 자음으로 끝나는지 확인합니다.
 * @example
 * Hangul.endsWithConsonant('수소'); // false
 * Hangul.endsWithConsonant('헬륨'); // true
 * @param {string} str
 * @returns {boolean}
 */
const endsWithConsonant = (str) => {
  const last = str[str.length - 1];
  return isHangulComplete(last) && (last.charCodeAt(0) - 44032) % 28 > 0;
};

/**
 * target에 search가 포함되는지 확인합니다.
 * @example
 * Hangul.includes('달걀', '닭'); // true
 * @param {string} target
 * @param {string} search
 * @returns {boolean}
 */
const includes = (target, search) => flatDisassemble(target).join('').includes(flatDisassemble(search).join(''));

module.exports = {
  isConsonant,
  isVowel,
  isChoseong,
  isJungseong,
  isJongseong,
  isHangul,
  isHangulComplete,
  assemble,
  disassemble,
  flatAssemble,
  flatDisassemble,
  endsWithConsonant,
  includes,
};
