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

const fs = require('fs');
const path = require('path');

const Kokoa = require('../lib');

const dir = path.join(__dirname, '../data/news');
const kokoa = new Kokoa();

if (fs.existsSync(dir)) {
  fs.readdirSync(dir).forEach((file) => {
    const { title, content } = JSON.parse(fs.readFileSync(path.join(dir, file)).toString());
    if (title && content) {
      kokoa.train(title);
      kokoa.train(content);
    }
  });
  kokoa.update();
  kokoa.getModel().saveFile(path.join(__dirname, '../data/words.csv'));
}
