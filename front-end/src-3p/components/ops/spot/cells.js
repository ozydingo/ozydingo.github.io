const PSEUDO_PARAGRAPH_LENGTH = 250;

function splitIntoParagraphs(cells) {
  const paragraphs = [];
  let lastIndex = 0;
  const endParagraph = {actual: {final: "{\"paragraph\":true}"}};
  cells.concat([endParagraph]).forEach((cell, ii) => {
    if (ii === 0) { return; }
    const parsed = parseCell(cell.actual && cell.actual.final);
    if (parsed.metadata && parsed.metadata.paragraph) {
      paragraphs.push(cells.slice(lastIndex, ii));
      lastIndex = ii;
    }
  });
  return paragraphs;
}

function parseCell(contents) {
  if (contents == undefined || contents === "{}") {
    return {text: null, metadata: null};
  }

  if (!contents || !contents.startsWith("{")) {
    return {text: contents, metadata: {}};
  }

  const result = contents.match(/(\{.*\})\s*(.*)/);
  if (!result) { return {text: contents, metadata: {}}; }

  try {
    const metadata = JSON.parse(result[1]);
    let text = result[2];
    if (metadata.speaker && text) {
      text = `${metadata.speaker} ${text}`;
    } else if (metadata.speaker) {
      text = metadata.speaker;
    }
    return {text, metadata};
  } catch (err) {
    return {text: contents, metadata: {}};
  }
}

function pseudoParagraphize(cells) {
  const paragraphs = [];
  let paragraphStart = 0;
  cells.forEach((cell, index) => {
    const numCells = index - paragraphStart + 1;
    if (numCells >= PSEUDO_PARAGRAPH_LENGTH || index === cells.length - 1) {
      paragraphs.push(cells.slice(paragraphStart, paragraphStart + numCells));
      paragraphStart = paragraphStart + numCells;
    }
  });
  return paragraphs;
}

function deDupCells(cells) {
  if (cells.length === 0) { return []; }

  const cellGroups = [];
  cells.forEach(cell => {
    if (cellGroups.length === 0 || cell.time !== cellGroups[cellGroups.length - 1][0].time) {
      cellGroups.push([cell]);
    } else {
      cellGroups[cellGroups.length - 1].push(cell);
    }
  });

  const deDupedCells = cellGroups.map(group => {
    if (group.length === 1) {
      return group[0];
    } else {
      const mergedCell = group[0];
      const combinedScore = 1 - group.reduce((res, item) => res * (1 - item.spotScore), 1);
      mergedCell.spotScore = combinedScore;
      return mergedCell;
    }
  });

  return deDupedCells;
}

function classifierPerformanceStats(cells) {
  const sortedCells = cells.slice().sort((a, b) => b.spotScore - a.spotScore);

  let detections = 0;
  let falseAlarms = 0;
  const rocStats = sortedCells.map(cell => {
    const stat = {
      threshold: cell.spotScore,
      detections,
      falseAlarms,
    };
    if (cell.is_error) { detections += 1;}
    if (!cell.is_error) { falseAlarms += 1;}
    return stat;
  });
  rocStats.push({
    threshold: 0,
    detections,
    falseAlarms,
  });

  return {
    rocStats,
    numCells: cells.length,
    numErrors: detections,
    numCorrect: falseAlarms,
  };
}

function findRocPoint(threshold, rocStats) {
  // TODO: use binary serach
  return rocStats.find(stat => stat.threshold <= threshold);
}

export default {
  classifierPerformanceStats,
  deDupCells,
  findRocPoint,
  parseCell,
  pseudoParagraphize,
  splitIntoParagraphs,
};
