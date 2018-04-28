#!/usr/bin/env node

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

/* eslint no-console: "off" */

const fs = require('fs');
const path = require('path');

const { Dictionary, DictionaryConverter } = require('../lib');

const args = process.argv.slice(2);

if (args.length > 0) {
  const dictionary = new Dictionary(DictionaryConverter.extractFrom(args[0], args.slice(1)));
  const outputPath = path.join(path.dirname(args[0]), 'dictionary.json');

  if (fs.existsSync(outputPath)) {
    console.error(`Error: ${outputPath} already exists!`);
  } else {
    fs.writeFileSync(outputPath, JSON.stringify(dictionary));
  }
} else {
  console.error('Error: The file path must be given!');
}
