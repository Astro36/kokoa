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

const Dictionary = require('./dictionary/TrainableDictionary');
const Kokoa = require('./Kokoa');

const k = new Kokoa();
k.load(new Dictionary({
  서: '명사', 설: '명사', 설현: '명사', 노래: '명사', 부르: '동사',
}));
console.log(k.run('설혀니 노랠 부른다'));
