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

const dictionary = new TrainableDictionary();
dictionary.train(fs.readFileSync('./data/the-battle-of-midway.txt').toString())

const kokoa = new Kokoa();
kokoa.load(dictionary);

console.log(KokoaUtils.stringify(kokoa.run('거기에다 미드웨이에서 출격한 항공기들의 공격과 이들을 막으려는 제로센들의 요격이 진행되는 와중에 1차 공격대가 함대 상공에 도착해서 착함을 기다리는 등 바다와 하늘 모두 난장판이었다.')));
