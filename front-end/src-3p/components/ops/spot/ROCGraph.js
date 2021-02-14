import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';

// When number of cells is over some threshold, too many elements cause
// React's maximum call stack size to be exceeded.
function downsampleRocStats(rocStats) {
  const maxPoints = 1000;
  if (rocStats.length <= maxPoints) { return rocStats; }

  const indices = (Array(maxPoints).fill(null)).map((_item, index) => index);
  const points = indices.map(index => {
    // We want start and end to be fixed, and evenly distribute the sample
    // points that remain between these two anchors
    const scaledIndex = Math.round(index * (rocStats.length - 1) / (maxPoints - 1));
    return rocStats[scaledIndex];
  });
  return points;
}

function linesFromRocStats(rocStats) {
  const useStats = downsampleRocStats(rocStats);
  const indices = useStats.map((_stat, index) => index);
  const lines = indices.slice(1).map(index => {
    return {
      x1: useStats[index - 1].falseAlarms,
      x2: useStats[index].falseAlarms,
      y1: useStats[index - 1].detections,
      y2: useStats[index].detections,
    };
  });
  return lines;
}

function ROCGraph(props) {
  const rocLines = useMemo(() => {
    const rocStats = props.rocStats || [];
    return linesFromRocStats(rocStats);
  }, [props.rocStats]);

  function xPos(falseAlarms) {
    if (!props.numCorrect) { return null; }

    const frac = falseAlarms / props.numCorrect;
    return `${Math.round(1000 * frac) / 10}%`;
  }

  function yPos(detections) {
    if (!props.numCorrect) { return null; }

    const frac = detections / props.numErrors;
    return `${100 - Math.round(1000 * frac) / 10}%`;
  }

  return (
    <svg className={css(styles.svg)}>
      <line x1="0%" y1="100%" x2="100%" y2="0%" stroke="#ccc" strokeWidth="1" strokeDasharray="7 2"/>
      {
        rocLines.map((line, index) => (
          <line
            key={index}
            x1={xPos(line.x1)}
            x2={xPos(line.x2)}
            y1={yPos(line.y1)}
            y2={yPos(line.y2)}
            stroke="#444"
            strokeWidth="1"
          />
        ))
      }
      <circle cx={xPos(props.falseAlarms)} cy={yPos(props.detections)} r="5" fill="#303f9f"/>
    </svg>
  );
}

ROCGraph.propTypes = {
  rocStats: PropTypes.arrayOf(PropTypes.shape({
    threshold: PropTypes.number,
    detections: PropTypes.number,
    falseAlarms: PropTypes.number,
  })).isRequired,
  numErrors: PropTypes.number.isRequired,
  numCorrect: PropTypes.number.isRequired,
  detections: PropTypes.number.isRequired,
  falseAlarms: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  svg: {
    border: "1px solid #888",
    width: "150px",
    height: "150px",
  },
});

export default ROCGraph;
