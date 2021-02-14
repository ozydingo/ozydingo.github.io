import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';

import ROCGraph from "./ROCGraph";

import Cells from "./cells";

function TranscriptMetrics(props) {
  const transcript = props.transcript || {};

  const cellStats = useMemo(() => {
    if (!transcript || !transcript.cells) {
      return {};
    }

    const stats = Cells.classifierPerformanceStats(transcript.cells);
    return stats;
  }, [transcript]);

  const rocStat = useMemo(() => {
    if (props.spotThreshold === undefined || !cellStats || !cellStats.rocStats) {
      return {};
    }

    return Cells.findRocPoint(props.spotThreshold, cellStats.rocStats);
  }, [props.spotThreshold, cellStats]);

  const pctFalseAlarm = rocStat.falseAlarms && Math.round(100 * rocStat.falseAlarms / cellStats.numCorrect);
  const pctDetections = rocStat.falseAlarms && Math.round(100 * rocStat.detections / cellStats.numErrors);

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.graph)}>
        <ROCGraph
          rocStats={cellStats.rocStats}
          numErrors={cellStats.numErrors}
          numCorrect={cellStats.numCorrect}
          detections={rocStat.detections}
          falseAlarms={rocStat.falseAlarms}
        />
      </div>
      <div className={css(styles.table)}>
        <table>
          <tbody>
            <tr>
              <td>Total cells:</td>
              <td>{cellStats.numCells}</td>
            </tr>
            <tr>
              <td>Total edits:</td>
              <td>{cellStats.numErrors}</td>
            </tr>
            <tr>
              <td>Edits detected:</td>
              <td>{rocStat.detections} ({pctDetections}%)</td>
            </tr>
            <tr>
              <td>False alarms:</td>
              <td>{rocStat.falseAlarms} ({pctFalseAlarm}%)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: "0.5em",
    display: "flex",
    flexDirection: "row",
  },
  graph: {
    marginRight: "1rem",
    flex: "4",
    display: "flex",
    justifyContent: "flex-end",
  },
  table: {
    flex: "5",
    display: "flex",
    justifyContent: "flex-start",
  }
});

TranscriptMetrics.propTypes = {
  transcript: PropTypes.shape({
    cells: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      is_error: PropTypes.boolean,
      spotScore: PropTypes.any,
    }))
  }).isRequired,
  spotThreshold: PropTypes.number.isRequired,
};

export default TranscriptMetrics;
