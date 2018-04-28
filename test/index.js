/* KokoaNLP
Copyright (C) 2018  Astro

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

const fs = require('fs');

const { Kokoa, KokoaUtils, TrainableDictionary } = require('../lib');

const dictionary = new TrainableDictionary({
  서: '명사', 설: '명사', 설현: '명사', 노래: '명사', 부르: '동사', 춤: '명사', 추다: '명사',
});
const kokoa = new Kokoa();
kokoa.load(dictionary);

console.log(KokoaUtils.stringify(kokoa.run('설혀니 노랠 부른다ㄱㄱ "그리고" 춤을 춘다.. gk".')));
