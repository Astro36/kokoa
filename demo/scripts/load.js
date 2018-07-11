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

onmessage = (e) => {
  const spacingModel = {
    trigramFrequencies: [],
    spacingFrequencies: [],
    scores: [],
  };
  const wordsModel = {
    frequencies: [],
    scores: [],
  };
  let isSpacingModel = true;
  e.data.split('\n').forEach((value) => {
    if (value === '---') {
      isSpacingModel = false;
    } else if (isSpacingModel) {
      const [text, trigramFrequency, spacingFrequency, score] = value.split(',');
      spacingModel.trigramFrequencies.push([text, Number(trigramFrequency)]);
      spacingModel.spacingFrequencies.push([text, Number(spacingFrequency)]);
      spacingModel.scores.push([text, Number(score)]);
    } else {
      const [text, frequency, score] = value.split(',');
      wordsModel.frequencies.push([text, Number(frequency)]);
      wordsModel.scores.push([text, Number(score)]);
    }
  });
  postMessage([spacingModel, wordsModel]);
};
