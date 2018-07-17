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

const assert = require('assert');
const path = require('path');

const Kokoa = require('../lib');

describe('Kokoa', () => {
  const kokoa = Kokoa.load(path.join(__dirname, '../data/kokoa.*.csv'));
  describe('#chunks(document)', () => {
    it('Returns chunks from the given document.', () => {
      assert.deepEqual(kokoa.chunks('하늘에는 달이 없고 땅에는 바람이 없습니다.'), ['하늘에는', '달이', '없고', '땅에는', '바람이', '없습니다', '.']);
    });
  });
  describe('#keysentences(document, options)', () => {
    it('Returns keysentences of the given document.', () => {
      assert.ok(Array.isArray(kokoa.keysentences('당신의 얼굴은 봄하늘의 고요한 별이어요. 그러나 찢어진 구름 사이로 돋아오는 반달 같은 얼굴이 없는 것이 아닙니다. 만일 어여쁜 얼굴만을 사랑한다면 왜 나의 베갯모에 달을 수놓지 않고 별을 수놓아요.')));
    });
  });
  describe('#keywords(document, options)', () => {
    it('Returns keywords of the given document.', () => {
      assert.ok(Array.isArray(kokoa.keywords('오월 어느 날 그하로 무덥던 날 떨어져 누운 꽃잎마저 시들어버리고는 천지에 모란은 자취도 없어지고 뻗쳐오르던 내보람 서운케 무너졌느니 모란이 지고말면 그뿐 내 한해는 다 가고말아 삼백예순날 하냥 섭섭해 우옵네다')));
    });
  });
  describe('#morphs(document, options)', () => {
    it('Returns morphs of the given document.', () => {
      assert.ok(Array.isArray(kokoa.morphs('동방은 하늘도 다 끝나고 비 한방울 나리잖는 그때에도 오히려 꽃은 빨갛게 피지 않는가')));
    });
  });
  describe('#sentences(document)', () => {
    it('Returns sentences of the given document.', () => {
      assert.deepEqual(kokoa.sentences('하고 싶은 말을 못하면 가슴에 멍이 든다. 쌓이고 쌓인 분(憤)이 입을 두고 어디로 가랴. 산에 올라 땅을 파서 하고 싶은 말을 흙에다 묻고 들에 나가 하늘을 우러러 하고 싶은 말을 바람에 부치다.'), ['하고 싶은 말을 못하면 가슴에 멍이 든다.', '쌓이고 쌓인 분(憤)이 입을 두고 어디로 가랴.', '산에 올라 땅을 파서 하고 싶은 말을 흙에다 묻고 들에 나가 하늘을 우러러 하고 싶은 말을 바람에 부치다.']);
    });
  });
  describe('#spacing(document, options)', () => {
    it('Returns spaced sentence from the given document.', () => {
      assert.equal(typeof kokoa.spacing('우리는저마다눈감기싫은밤이있다'), 'string');
    });
  });
  describe('#words(document, options)', () => {
    it('Returns words of the given document.', () => {
      assert.ok(Array.isArray(kokoa.words('가는 님은 가슴의 사랑까지 없애고 가고 젊음은 늙음으로 바뀌어 든다. 들가시나무의 밤드는 검은 가지 잎새들만 저녁 빛에 희끄무레히 꽃 지듯 한다.')));
    });
  });
});
