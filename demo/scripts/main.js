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

const { Kokoa, model: { SpacingEngine, WordsEngine } } = require('../lib');

const elementProgress = document.getElementById('load-progress');
const elementRun = document.getElementById('run');
const elementContent = document.getElementById('content');
const elementKeywords = document.getElementById('keywords');
const elementKeysentences = document.getElementById('keysentences');
const elementWords = document.getElementById('words');

const request = new XMLHttpRequest();
request.open('GET', './kokoa-data.csv', true);
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
      const spacingModel = {
        trigramFrequencies: [],
        spacingFrequencies: [],
        scores: [],
      };
      const wordsModel = {
        frequencies: [],
        scores: [],
      };
      let isSpacingModel = true;
      request.responseText.split('\n').forEach((value) => {
        if (value === '---') {
          isSpacingModel = false;
        } else if (isSpacingModel) {
          const [text, trigramFrequency, spacingFrequency, score] = value.split(',');
          spacingModel.trigramFrequencies.push([text, Number(trigramFrequency)]);
          spacingModel.spacingFrequencies.push([text, Number(spacingFrequency)]);
          spacingModel.scores.push([text, Number(score)]);
        } else {
          const [text, frequency, score] = value.split(',');
          wordsModel.frequencies.push([text, Number(frequency)]);
          wordsModel.scores.push([text, Number(score)]);
        }
      });
      // Init KokoaNLP.
      const spacingEngine = new SpacingEngine(spacingModel);
      const wordsEngine = new WordsEngine(wordsModel);
      console.log(Kokoa);
      const kokoa = new Kokoa({ spacingEngine, wordsEngine });
      elementRun.addEventListener('click', () => {
        const content = elementContent.value;
        // const keywords = kokoa.keywords(content);
        // const keysentences = kokoa.keysentences(content);
        const morphs = kokoa.morphs(content);
        const words = kokoa.words(content);
        // elementKeywords.innerHTML = '';
        // keywords.forEach((keyword) => {
        //   const list = document.createElement('li');
        //   list.innerHTML = keyword;
        //   elementKeywords.appendChild(list);
        // });
        // elementKeysentences.innerHTML = '';
        // keysentences.forEach((keysentence) => {
        //   const list = document.createElement('li');
        //   list.innerHTML = keysentence;
        //   elementKeysentences.appendChild(list);
        // });
        elementWords.textContent = words.join(',');
      });
    }
  }
};
request.send(null);
