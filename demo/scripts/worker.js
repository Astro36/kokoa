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

const { Kokoa, model: { SpacingEngine, WordsEngine } } = require('../../lib');

// const elementLoadProgress = document.getElementById('load-progress');
// const elementLoadProgressbar = document.getElementById('load-progressbar');

let kokoa;

onmessage = (e) => {
  const { type, input } = e.data;
  const request = new XMLHttpRequest();
  switch (type) {
    case 'create':
      kokoa = new Kokoa();
      if (input) {
        kokoa.train(input);
        kokoa.update();
        postMessage({ type, output: true });
      }
      postMessage({ type, output: true });
      break;
    case 'load':
      request.open('GET', './kokoa.all.csv', true);
      request.onerror = () => {
        postMessage({ type, output: false });
      };
      request.onprogress = (event) => {
        postMessage({ type: 'load-message', output: `Loading: ${((event.loaded / event.total) * 99).toFixed(2)}%` });
      };
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 200) {
            // Load prebuilt data.
            const contents = request.responseText;
            const [spacingEngineContent, wordsEngineContent] = contents.split('---');
            postMessage({ type: 'load-message', output: 'Parsing spacing engines...' });
            const spacingEngine = SpacingEngine.parse(spacingEngineContent);
            postMessage({ type: 'load-message', output: 'Parsing words engines...' });
            const wordsEngine = WordsEngine.parse(wordsEngineContent);
            // Init KokoaNLP.
            postMessage({ type: 'load-message', output: 'Initializing KokoaNLP instance...' });
            kokoa = new Kokoa({ spacingEngine, wordsEngine });
            postMessage({ type, output: true });
          }
        }
      };
      request.send(null);
      break;
    case 'train':
      kokoa.train(input);
      kokoa.update();
      postMessage({ type, output: true });
      break;
    case 'keysentences':
      postMessage({ type, output: kokoa.keysentences(input) });
      break;
    case 'keywords':
      postMessage({ type, output: kokoa.keywords(input) });
      break;
    case 'morphs':
      postMessage({ type, output: kokoa.morphs(input) });
      break;
    case 'spacing':
      postMessage({ type, output: kokoa.spacing(input) });
      break;
    case 'words':
      postMessage({ type, output: kokoa.words(input) });
      break;
    default:
  }
};
