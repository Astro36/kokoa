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

const { Kokoa, KokoaUtil } = require('../lib');

const elementProgress = document.getElementById('load-progress');
const elementRun = document.getElementById('run');
const elementContent = document.getElementById('content');
const elementKeywords = document.getElementById('keywords');
const elementKeysentences = document.getElementById('keysentences');
const elementWords = document.getElementById('words');

const request = new XMLHttpRequest();
request.open('GET', './words.csv', true);
request.onerror = () => {
  elementProgress.textContent = 'Load Error';
};
request.onprogress = (event) => {
  elementProgress.textContent = `Loading: ${((event.loaded / event.total) * 100).toFixed(2)}%`;
};
request.onreadystatechange = () => {
  if (request.readyState === 4) {
    if (request.status === 200) {
      // Load prebuilt data.
      const originalFrequencies = [];
      const originalScores = [];
      const reversedFrequencies = [];
      const reversedScores = [];
      let isOriginal = true;
      request.responseText.split('\n').forEach((value) => {
        if (value === '---') {
          isOriginal = false;
        } else {
          const [text, frequency, score] = value.split(',');
          if (isOriginal) {
            originalFrequencies.push([text, Number(frequency)]);
            originalScores.push([text, Number(score)]);
          } else {
            reversedFrequencies.push([text, Number(frequency)]);
            reversedScores.push([text, Number(score)]);
          }
        }
      });

      // Init KokoaNLP.
      const model = {
        originalFrequencies,
        originalScores,
        reversedFrequencies,
        reversedScores,
      };
      const kokoa = new Kokoa(model);
      const util = new KokoaUtil(kokoa);
      elementRun.addEventListener('click', () => {
        const content = elementContent.value;
        const keywords = util.keywords(content);
        const keysentences = util.keysentences(content);
        const words = util.words(content);
        elementKeywords.innerHTML = '';
        keywords.forEach((keyword) => {
          const list = document.createElement('li');
          list.innerHTML = keyword;
          elementKeywords.appendChild(list);
        });
        elementKeysentences.innerHTML = '';
        keysentences.forEach((keysentence) => {
          const list = document.createElement('li');
          list.innerHTML = keysentence;
          elementKeysentences.appendChild(list);
        });
        elementWords.textContent = words.join('/');
      });
    }
  }
};
request.send(null);
