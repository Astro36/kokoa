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
const StreamArray = require('stream-json/utils/StreamArray');

const Kokoa = require('../lib');

const kokoa = new Kokoa();

const stream = StreamArray.make();
stream.output.on('data', object => kokoa.train(object.value.text));
stream.output.on('end', () => {
  console.log('done');
  kokoa.update();
  fs.writeFileSync('./data/namuwiki-words.json', JSON.stringify(kokoa.save()));
});

fs.createReadStream('./data/namuwiki.json').pipe(stream.input);
