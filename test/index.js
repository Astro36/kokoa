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

const kokoa = Kokoa.loadFile('./data/words.csv');
const util = new KokoaUtil(kokoa);

console.log(util.words('태평양 전쟁 개전 당시 일본 해군의 전략은 외곽 방어망 곳곳에 배치된 지상비행장이 방어의 근거지가 되고 유사시 적을 방어선 가까이 끌어들이는 동안 항공기를 집결하여 격퇴하는 것이었다.'));
