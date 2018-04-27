var Hangul = require('hangul-js');

class LRTokenizer {
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  run(text) {
    // 설혀니 노랠 부른다 (설현이 노래를 부른다)
    // 설혀니
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
