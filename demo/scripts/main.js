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


const contentExample = `인공지능이란 무엇인가, 무엇을 지능이라고 부를까를 명확하게 정의하기는 쉽지 않다. 그리고 이는 철학적인 문제가 아니고 이 문제에 어떤 대답을 선호하는가에 따라서 연구 목적과 방향이 완전히 달라진다.
한 가지 대답은 인간의 '지능'을 필요로 하는 일을 컴퓨터가 처리할 수 있으면 그것이 바로 인공지능이라는 것이다. 또 다른 대답은 인간과 같은 방식으로 이해를 할 수 있어야 인공지능이라는 것이다. 이 두 가지 대답 역시 세부적으로는 "지능을 필요로 하는 일이란 무엇인가?" 내지는 "인간과 같은 방식이란 무엇인가?" 라는 질문에 대한 대답에 따라서 서로 다른 여러 종류의 대답을 내포하고 있다. 물론 이 두 가지 대답은 배타적이지는 않다. 인간과 같은 종류의 지능을 가지고 '지능'을 필요로 하는 일도 처리할 수 있는 컴퓨터를 만드는 것은 수많은 컴퓨터 공학자들의 꿈과 희망이겠지만, 적어도 단기간에 그런 목표에 도달할 가능성은 희박하다.
만약 '지능을 필요로 하는 일'을 처리하는 것이 인공지능이라고 정의한다면, 인공지능은 인간이 어떤 방식으로 사고하는가를 고민할 필요가 없으며, 감성과 같은 것 또한 고려할 필요가 없다. 모로 가든 서울만 가면 되니까. 이러한 방향의 인공지능 연구에서는 초기에는 전문가가 필요한 일을 복잡한 소프트웨어를 통해서 처리하는 전문가 시스템이 대세였으며, 이러한 전문가 시스템은 실행 방식에서는 일반적인 소프트웨어와 특별한 차별성이 없고 전문가들이 문제를 해결하는 방식을 가능한 한 쉽고 정확하게 소프트웨어에 반영할 수 있는 방법을 제공하는 데 주력했다.
그 외에도 체스를 두는 것 역시 이 분야에 들어갔고 실제로 너무 간단한 인공지능 부류에 속하지만 체스 두는 기계는 아주 이르게도 인공지능 연구에서 제외되었다. 체스를 연산으로 처리하게 만드는 것은 대단히 어렵다. 수 하나를 더 내다보려면 평균적으로 26배의 연산이 더 필요해지기 때문에 아무리 현대의 컴퓨터가 빠른 속도로 발전하고 있다고 해도 5~6수를 내다보는 것이 고작이며 수십 수를 내다보는 체스 기사들과는 상대가 되지 않는다. 이 때문에 실제 체스 머신들은 지금까지의 체스 기보를 대량으로 입력한 후 그 체스 기보에서 같은 모양이 나온 적이 있는지를 하나하나 대조하는 방식으로 처리한다. 세계 챔피언을 이긴 IBM의 체스 머신은 7만 개가 넘는 기보를 이용했다고 한다. 하지만 이것은 더이상 인공지능의 분야가 아닌 그냥 데이터 병렬처리를 빠른 속도로 해낼 수 있는 슈퍼컴퓨터의 성능 과시용에 불과하다. 즉, 복잡한 지능을 구현한 게 아니라 고등사고로 할 수 있는 무수히 많은 일에서 조각 하나를 따와 펼칠 수 있는 구조를 만들었을 뿐이다. 지능이라는 단어의 정의에 따라서 이것도 인공지능이라고 쳐주는 교수/학자도 있고 빼는 학자도 있지만 더 이상 연구 가치가 없다는 점은 바뀌지 않는다.`;

const elementLoadButton = document.getElementById('load-button');
const elementLoadProgress = document.getElementById('load-progress');
const elementLoadProgressbar = document.getElementById('load-progressbar');
const elementTrainButton = document.getElementById('train-button');
const elementTrainData = document.getElementById('train-data');
const elementTrainProgressbar = document.getElementById('train-progressbar');
const elementKeywordsButton = document.getElementById('keywords-button');
const elementKeywordsInput = document.getElementById('keywords-input');
const elementKeywordsOutput = document.getElementById('keywords-output');
const elementKeysentencesButton = document.getElementById('keysentences-button');
const elementKeysentencesInput = document.getElementById('keysentences-input');
const elementKeysentencesOutput = document.getElementById('keysentences-output');
const elementMorphsButton = document.getElementById('morphs-button');
const elementMorphsInput = document.getElementById('morphs-input');
const elementMorphsOutput = document.getElementById('morphs-output');
const elementSpacingButton = document.getElementById('spacing-button');
const elementSpacingInput = document.getElementById('spacing-input');
const elementSpacingOutput = document.getElementById('spacing-output');
const elementWordsButton = document.getElementById('words-button');
const elementWordsInput = document.getElementById('words-input');
const elementWordsOutput = document.getElementById('words-output');

let isInit = false;
let isWaiting = false;

const worker = new Worker('worker.js');
worker.onmessage = (e) => {
  const { type, output } = e.data;
  isWaiting = false;
  switch (type) {
    case 'create':
      isInit = true;
      break;
    case 'load':
      if (output) {
        elementLoadProgress.textContent = 'Complete!';
        elementLoadProgressbar.style.visibility = 'hidden';
      } else {
        elementLoadProgress.textContent = 'Load Error!';
      }
      isInit = true;
      break;
    case 'load-message':
      elementLoadProgress.textContent = output;
      break;
    case 'train':
      elementTrainProgressbar.style.visibility = 'hidden';
      break;
    case 'keysentences':
      elementKeysentencesOutput.innerHTML = output.join('<br>');
      break;
    case 'keywords':
      elementKeywordsOutput.textContent = output.join(', ');
      break;
    case 'morphs':
      elementMorphsOutput.textContent = output.join('/');
      break;
    case 'spacing':
      elementSpacingOutput.textContent = output;
      break;
    case 'words':
      elementWordsOutput.textContent = output.join(', ');
      break;
    default:
  }
};

document.addEventListener('DOMContentLoaded', () => {
  M.Collapsible.init(document.querySelectorAll('.collapsible'));
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Tabs.init(document.querySelectorAll('.tabs'));
  elementKeysentencesInput.textContent = contentExample;
  elementKeywordsInput.textContent = contentExample;
  elementLoadButton.addEventListener('click', () => {
    if (!isInit && !isWaiting) {
      isWaiting = true;
      elementLoadProgressbar.style.visibility = 'visible';
      worker.postMessage({ type: 'load' });
    }
  });
  elementTrainButton.addEventListener('click', () => {
    if (!isWaiting) {
      const content = elementTrainData.value;
      if (isInit) {
        if (content) {
          isWaiting = true;
          elementTrainProgressbar.style.visibility = 'visible';
          worker.postMessage({ type: 'train', input: content });
        }
      } else {
        isWaiting = true;
        worker.postMessage({ type: 'create', input: content });
      }
    }
  });
  elementKeysentencesButton.addEventListener('click', () => {
    if (isInit && !isWaiting) {
      const content = elementKeysentencesInput.value;
      if (content) {
        isWaiting = true;
        worker.postMessage({ type: 'keysentences', input: content });
      }
    }
  });
  elementKeywordsButton.addEventListener('click', () => {
    if (isInit && !isWaiting) {
      const content = elementKeywordsInput.value;
      if (content) {
        isWaiting = true;
        worker.postMessage({ type: 'keywords', input: content });
      }
    }
  });
  elementMorphsButton.addEventListener('click', () => {
    if (isInit && !isWaiting) {
      const content = elementMorphsInput.value;
      if (content) {
        isWaiting = true;
        worker.postMessage({ type: 'morphs', input: content });
      }
    }
  });
  elementSpacingButton.addEventListener('click', () => {
    if (isInit && !isWaiting) {
      const content = elementSpacingInput.value;
      if (content) {
        isWaiting = true;
        worker.postMessage({ type: 'spacing', input: content });
      }
    }
  });
  elementWordsButton.addEventListener('click', () => {
    if (isInit && !isWaiting) {
      const content = elementWordsInput.value;
      if (content) {
        isWaiting = true;
        worker.postMessage({ type: 'words', input: content });
      }
    }
  });
});
