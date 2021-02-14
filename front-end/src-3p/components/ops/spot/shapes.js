import PropTypes from "prop-types";

export const predictionShape = PropTypes.shape({
  prediction: PropTypes.shape({
    prob: PropTypes.arrayOf(PropTypes.number),
    label: PropTypes.arrayOf(PropTypes.string),
  })
});

export const transcriptActualShape = PropTypes.shape({
  time: PropTypes.string,
  asr_confidence: PropTypes.number,
  asr: PropTypes.string,
  post_asr: PropTypes.string,
  edited: PropTypes.string,
  qa: PropTypes.string,
  final: PropTypes.string,
});

export const mergedPredictionDataShape = PropTypes.shape({
    prediction: predictionShape,
    actual: transcriptActualShape,
});

export const spotShape = PropTypes.shape({
  time: PropTypes.string,
  score: PropTypes.number,
  cell: mergedPredictionDataShape,
});

export const spotsShape = PropTypes.shape({
  punc: PropTypes.arrayOf(spotShape),
  text: PropTypes.arrayOf(spotShape),
});

export const spotNameShape = PropTypes.shape({
  time: PropTypes.string,
  name: PropTypes.string,
  score: PropTypes.number,
});
