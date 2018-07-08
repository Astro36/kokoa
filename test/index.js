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

const { Kokoa } = require('../lib');

const kokoa = Kokoa.load('./data/kokoa.*.csv');

// kokoa.train(fs.readFileSync('./data/test.txt').toString());
// kokoa.update();
console.log(kokoa.spacing('람다대수는알론조처치에의해튜링기계보다먼저제안된계산모델이며람다대수로할수있는모든계산은튜링기계로도가능하고그역도성립한다는것이증명되었다.람다대수와동치인언어역시튜링완전하다.프로그래밍언어에서는튜링기계보다람다대수를더널리이용한다.'));
console.log(kokoa.morphs('8일 기상청에 따르면 이날 오후 3시 현재 우리나라는 동해 북부 해상에 있는 고기압 가장자리에 들어 전국에 가끔 구름이 많은 상태다. ').join('/'));
