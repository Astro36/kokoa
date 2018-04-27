class SentenceTokenizer{
  constructor() {

  }

  run(text) {
    // Regex from open-korean-text
    return text.match(/[^.!?…\s][^.!?…]*(?:[.!?…](?!['"]?\s|$)[^.!?…]*)*[.!?…]?['"]?(?=\s|$)/g)
      .map(value => value.replace(/([^ㄱ-ㅎ가-힣]+)/g, ' $1 ').split(/\s+/))
  }
}

module.exports = SentenceTokenizer;
