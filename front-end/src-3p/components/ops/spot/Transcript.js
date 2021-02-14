import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { StyleSheet, css } from 'aphrodite';

import * as Spotter from "./spotter.js";
import TranscriptCell from "./TranscriptCell";

import { mergedPredictionDataShape, spotsShape } from "./shapes";

function Transcript(props) {
  const { spots } = props;
  const spotMap = useMemo(() => Spotter.indexSpots(spots), [props.spots]);

  return (
    <div className={css(styles.body)}>
      {
        props.paragraphs.map((paragraph, pIndex) => (
          <p key={pIndex} className={css(styles.paragraph)}>
            {paragraph.map((cell, ii) => (
              <TranscriptCell
                key={ii}
                cell={cell}
                spotNames={spotMap[cell.actual.time] || []}
                spotThreshold={props.spotThreshold}
                seekVideo={props.seekVideo}
              />
            ))}
          </p>
        ))
      }
    </div>
  );
}

Transcript.propTypes = {
  paragraphs: PropTypes.arrayOf(
    PropTypes.arrayOf(mergedPredictionDataShape)
  ),
  seekVideo: PropTypes.func,
  spots: spotsShape,
  spotThreshold: PropTypes.number,
};

const styles = StyleSheet.create({
  body: {
    overflowY: "scroll",
    marginTop: "0.5em",
    border: "1px solid #ccc",
    padding: "0.5em",
  },
  paragraph: {
    display: "block",
    textAlign: "justify",
    marginBottom: "1em",
  }
});

export default Transcript;
