// Find and annotate all cells above a threshold for labels
export function spot(cells, labels, threshold) {
  const hits = cells.filter(cell => {
    return exceedsThreshold(cell, labels, threshold);
  });
  const spotted = hits.map(cell => {
    const time = cell.actual.time;
    const score = computeScore(cell, labels);
    return {
      time: time,
      score: score,
      cell: cell,
    };
  });
  return spotted.sort((a, b) => (b.score - a.score));
}

// Combine and index by timestamp a {label: spotResults, ...} object
export function indexSpots(namedSpots) {
  const map = {};
  Object.keys(namedSpots).forEach(name => {
    namedSpots[name].forEach(spot => {
      if (!map.hasOwnProperty(spot.time)) {
        map[spot.time] = [];
      }
      map[spot.time].push({
        time: spot.time,
        name,
        score: spot.score,
      });
    });
  });
  return map;
}

// Compute a single score for a cell given labels
// Method: max score among matching labels (L-infinity norm)
function computeScore(cell, labels) {
  let score = 0;
  cell.prediction.label.forEach((label, ii) => {
    const prob = cell.prediction.prob[ii];
    if (labels.includes(label) && prob >= score) {
      score = prob;
    }
  });
  return score;
}

function exceedsThreshold(cell, labels, threshold) {
  if (!cell.prediction) { return false; }

  const match = cell.prediction.label.find((label, ii) => {
    if (!labels.includes(label)) { return false; }

    const prob = cell.prediction.prob[ii];
    return prob > threshold;
  });
  return !!match;
}
