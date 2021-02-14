import React from "react";

import PropTypes from "prop-types";
import {StyleSheet, css} from 'aphrodite';

import Form from "react-bootstrap/Form";

function SpotControls(props) {
  function handleThreshold(name, event) {
    switch (name) {
      case 'Punctuation':
        props.handlers.setThresholdPunc(Number(event.target.value));
        return;
      case 'Text Deletion':
        props.handlers.setThresholdTextDelete(Number(event.target.value));
        return;
      case 'Text Insertion':
        props.handlers.setThresholdTextInsert(Number(event.target.value));
        return;
      case 'Text Substitution':
        props.handlers.setThresholdTextSubstitute(Number(event.target.value));
        return;
      case 'Capitalization':
        props.handlers.setThresholdCapitalization(Number(event.target.value));
        return;
      case 'Speaker Label':
        props.handlers.setThresholdSpeaker(Number(event.target.value));
        return;
      case 'Tag':
        props.handlers.setThresholdTag(Number(event.target.value));
        return;
      default:
        props.handlers.setThresholdTag(Number(event.target.value));
    } 
  }

  function handleMaxPercent(name, event) {
    switch (name) {
      case 'Punctuation':
        props.handlers.setMaxPercentPunc(Number(event.target.value));
        return;
      case 'Text Deletion':
        props.handlers.setMaxPercentTextDelete(Number(event.target.value));
        return;
      case 'Text Insertion':
        props.handlers.setMaxPercentTextInsert(Number(event.target.value));
        return;
      case 'Text Substitution':
        props.handlers.setMaxPercentTextSubstitute(Number(event.target.value));
        return;
      case 'Capitalization':
        props.handlers.setMaxPercentCapitalization(Number(event.target.value));
        return;
      case 'Speaker Label':
        props.handlers.setMaxPercentSpeaker(Number(event.target.value));
        return;
      case 'Tag':
        props.handlers.setMaxPercentTag(Number(event.target.value));
        return;
      default:
        props.handlers.setMaxPercentTag(Number(event.target.value));
    } 
  }

  function getPropsThredhold(name) {
    switch (name) {
      case 'Punctuation':
        return props.thresholdPunc;
      case 'Text Deletion':
        return props.thresholdTextDelete;
      case 'Text Insertion':
        return props.thresholdTextInsert;
      case 'Text Substitution':
        return props.thresholdTextSubstitute;
      case 'Capitalization':
        return props.thresholdCapitalization;
      case 'Speaker Label':
        return props.thresholdSpeaker;
      case 'Tag':
        return props.thresholdTag;
      default:
        return props.thresholdTag;
    } 
  }
  
  function getPropsMaxPercent(name) {
    switch (name) {
      case 'Punctuation':
        return props.maxPercentPunc;
      case 'Text Deletion':
        return props.maxPercentTextDelete;
      case 'Text Insertion':
        return props.maxPercentTextInsert;
      case 'Text Substitution':
        return props.maxPercentTextSubstitute;
      case 'Capitalization':
        return props.maxPercentCapitalization;
      case 'Speaker Label':
        return props.maxPercentSpeaker;
      case 'Tag':
        return props.maxPercentTag;
      default:
        return props.maxPercentTag;
    } 
  }
  
  const names = ['Punctuation', 'Text Deletion', 'Text Insertion', 'Text Substitution', 'Capitalization', 'Speaker Label', 'Tag'];
  
  return (
    <div className={css(styles.controls)}>
      <div className={css(styles.controlInputs)}>
        <Form>
          <Form.Group controlId="spotThreshold">
            {names.map(name => (
              <React.Fragment key={'parent-' + name}>
                <Form.Label key={'threshold-label-' + name}>{name} Threshold: {getPropsThredhold(name)}</Form.Label>
                <Form.Control
                  key={'threshold-control-' + name}
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={event => handleThreshold(name, event)}
                  value={getPropsThredhold(name)}
                />
                <Form.Label key={'maxpercent-label-' + name}>{name} Max: {Math.round(props.numPredictions * getPropsMaxPercent(name) / 100)}</Form.Label>
                <Form.Control
                  key={'maxpercent-control-' + name}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  onChange={event => handleMaxPercent(name, event)}
                  value={getPropsMaxPercent(name)}
                />
              </React.Fragment>
            ))}
          </Form.Group>
        </Form>
      </div>
    </div>
  );

}

SpotControls.propTypes = {
  numPredictions: PropTypes.number,
  handlers: PropTypes.shape({
    setMaxPercentPunc: PropTypes.func,
    setMaxPercentTextDelete: PropTypes.func,
    setMaxPercentTextInsert: PropTypes.func,
    setMaxPercentTextSubstitute: PropTypes.func,
    setMaxPercentCapitalization: PropTypes.func,
    setMaxPercentSpeaker: PropTypes.func,
    setMaxPercentTag: PropTypes.func,
    setThresholdPunc: PropTypes.func,
    setThresholdTextDelete: PropTypes.func,
    setThresholdTextInsert: PropTypes.func,
    setThresholdTextSubstitute: PropTypes.func,
    setThresholdCapitalization: PropTypes.func,
    setThresholdSpeaker: PropTypes.func,
    setThresholdTag: PropTypes.func,
  }),
  maxPercentPunc: PropTypes.number,
  maxPercentTextDelete: PropTypes.number,
  maxPercentTextInsert: PropTypes.number,
  maxPercentTextSubstitute: PropTypes.number,
  maxPercentCapitalization: PropTypes.number,
  maxPercentSpeaker: PropTypes.number,
  maxPercentTag: PropTypes.number,
  thresholdPunc: PropTypes.number,
  thresholdTextDelete: PropTypes.number,
  thresholdTextInsert: PropTypes.number,
  thresholdTextSubstitute: PropTypes.number,
  thresholdCapitalization: PropTypes.number,
  thresholdSpeaker: PropTypes.number,
  thresholdTag: PropTypes.number,
};

const styles = StyleSheet.create({
  controlDisplay: {
    flex: "1",
  },
  controlInputs: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
  },
  controls: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
});


export default SpotControls;
