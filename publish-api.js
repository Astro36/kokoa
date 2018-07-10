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

const Bundler = require('parcel');
const fs = require('fs');
const path = require('path');

const inDir = path.join(__dirname, './temp');
const outDir = path.join(__dirname, './docs/api');
const outAssetsDir = path.join(__dirname, './docs/api/assets');
const outTempDir = path.join(__dirname, './docs/api/temp');

const options = {
  outDir,
  outFile: 'index.html',
  publicUrl: './assets',
  watch: false,
  cache: true,
  cacheDir: '.cache',
  minify: true,
  target: 'browser',
  https: true,
  logLevel: 2,
  hmrPort: 0,
  sourceMaps: false,
  hmrHostname: '',
  detailedReport: false,
};

(async () => {
  const bundler = new Bundler(inDir, options);
  await bundler.bundle();
  if (!fs.existsSync(outAssetsDir)) {
    fs.mkdirSync(outAssetsDir);
  }
  fs.readdirSync(outDir).forEach((file) => {
    if (file.includes('.') && !file.includes('.html')) {
      fs.renameSync(path.join(outDir, file), path.join(outAssetsDir, file));
    }
  });
  fs.readdirSync(outTempDir).forEach((file) => {
    const outTempFile = path.join(outTempDir, file);
    fs.writeFileSync(path.join(outDir, file), fs.readFileSync(outTempFile)
      .toString()
      .split('href="assets/temp')
      .join('href=".'));
    fs.unlinkSync(outTempFile);
  });
  fs.rmdirSync(outTempDir);
})();
