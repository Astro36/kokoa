class Dictionary {
  constructor(words) {
    this.words = words;
  }

  has(word) {
    return word in this.words;
  }
}

module.exports = Dictionary;
