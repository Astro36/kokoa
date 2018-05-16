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

const { Kokoa } = require('../lib');

const kokoa = new Kokoa();

kokoa.train(fs.readFileSync('./data/the-battle-of-midway.txt').toString());
console.log(kokoa.run('전황이 계속 불리하게 돌아가는 상황에서 당시 미군의 사기는 바닥까지 떨어진 상태였다'));
