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
