import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';

import Cells from "./cells";
import Transcript from "./Transcript";
import * as Spotter from "./spotter";
import SpotControls from "./SpotControls";
import SpotKey from "./SpotKey";
// import TranscriptMetrics from "./TranscriptMetrics";
import Video from "./Video";

import { mergedPredictionDataShape } from "./shapes";

const defaultMaxPercentPunc = 100;
const defaultMaxPercentText = 100;
const defaultThresholdPunc = 1.0;
const defaultThresholdText = 1.0;
const labelsPunc = ["__label__P"];
const labelsTextDelete = ["__label__D"];
const labelsTextInsert = ["__label__I"];
const labelsTextSubstitute = ["__label__S"];
const labelsCapitalization = ["__label__C"];
const labelsSpeaker = ["__label__s"];
const labelsTag = ["__label__t"];

function EditJob(props) {
  const { data, video } = props;
  const numPredictions = data.filter(item => item.prediction).length;

  const [maxPercentPunc, setMaxPercentPunc] = useState(defaultMaxPercentPunc);
  const [maxPercentTextDelete, setMaxPercentTextDelete] = useState(defaultMaxPercentText);
  const [maxPercentTextInsert, setMaxPercentTextInsert] = useState(defaultMaxPercentText);
  const [maxPercentTextSubstitute, setMaxPercentTextSubstitute] = useState(defaultMaxPercentText);
  const [maxPercentCapitalization, setMaxPercentCapitalization] = useState(defaultMaxPercentText);
  const [maxPercentSpeaker, setMaxPercentSpeaker] = useState(defaultMaxPercentText);
  const [maxPercentTag, setMaxPercentTag] = useState(defaultMaxPercentText);
  const [thresholdPunc, setThresholdPunc] = useState(defaultThresholdPunc);
  const [thresholdTextDelete, setThresholdTextDelete] = useState(defaultThresholdText);
  const [thresholdTextInsert, setThresholdTextInsert] = useState(defaultThresholdText);
  const [thresholdTextSubstitute, setThresholdTextSubstitute] = useState(defaultThresholdText);
  const [thresholdCapitalization, setThresholdCapitalization] = useState(defaultThresholdText);
  const [thresholdSpeaker, setThresholdSpeaker] = useState(defaultThresholdText);
  const [thresholdTag, setThresholdTag] = useState(defaultThresholdText);

  const numCellsPunc = Math.round(maxPercentPunc / 100 * numPredictions);
  const numCellsTextDelete = Math.round(maxPercentTextDelete / 100 * numPredictions);
  const numCellsTextInsert = Math.round(maxPercentTextInsert / 100 * numPredictions);
  const numCellsTextSubstitute = Math.round(maxPercentTextSubstitute / 100 * numPredictions);
  const numCellsCapitalization = Math.round(maxPercentCapitalization / 100 * numPredictions);
  const numCellsSpeaker = Math.round(maxPercentSpeaker / 100 * numPredictions);
  const numCellsTag = Math.round(maxPercentTag / 100 * numPredictions);
  

  const paragraphs = useMemo(() => {
    if (!data) { return []; }

    return Cells.splitIntoParagraphs(data);
  }, [data]);

  const spots = useMemo(() => {
    if (!data) { return {}; }

    const punc = Spotter.spot(data, labelsPunc, thresholdPunc).slice(0, numCellsPunc);
    const text_delete = Spotter.spot(data, labelsTextDelete, thresholdTextDelete).slice(0, numCellsTextDelete);
    const text_insert = Spotter.spot(data, labelsTextInsert, thresholdTextInsert).slice(0, numCellsTextInsert);
    const text_substitute = Spotter.spot(data, labelsTextSubstitute, thresholdTextSubstitute).slice(0, numCellsTextSubstitute);
    const capitalization = Spotter.spot(data, labelsCapitalization, thresholdCapitalization).slice(0, numCellsCapitalization);
    const speaker = Spotter.spot(data, labelsSpeaker, thresholdSpeaker).slice(0, numCellsSpeaker);
    const tag = Spotter.spot(data, labelsTag, thresholdTag).slice(0, numCellsTag);
    const result = {punc, text_delete, text_insert, text_substitute, capitalization, speaker, tag};
    console.log(result); // eslint-disable-line no-console
    return result;
  }, [data, maxPercentPunc, maxPercentTextDelete, maxPercentTextInsert, 
      maxPercentTextSubstitute, maxPercentCapitalization, maxPercentSpeaker, maxPercentTag, 
      thresholdPunc, thresholdTextDelete, thresholdTextInsert, 
      thresholdTextSubstitute, thresholdCapitalization, thresholdSpeaker, thresholdTag]);

  function seekVideo(ms) {
    const sec = Number(ms) / 1000;
    document.querySelector("video").currentTime = sec;
    document.querySelector("video").play();
  }

  return (
    <div className="spot-main">
      <div className="spot-controls">
        <h3>Video</h3>
        <Video url={video.url} />
        <h3>Controls</h3>
        <SpotControls
          numPredictions={numPredictions}
          maxPercentPunc={maxPercentPunc}
          maxPercentTextDelete={maxPercentTextDelete}
          maxPercentTextInsert={maxPercentTextInsert}
          maxPercentTextSubstitute={maxPercentTextSubstitute}
          maxPercentCapitalization={maxPercentCapitalization}
          maxPercentSpeaker={maxPercentSpeaker}
          maxPercentTag={maxPercentTag}
          thresholdPunc={thresholdPunc}
          thresholdTextDelete={thresholdTextDelete}
          thresholdTextInsert={thresholdTextInsert}
          thresholdTextSubstitute={thresholdTextSubstitute}
          thresholdCapitalization={thresholdCapitalization}
          thresholdSpeaker={thresholdSpeaker}
          thresholdTag={thresholdTag}
          handlers={{
            setMaxPercentPunc, setMaxPercentTextDelete, setMaxPercentTextInsert, setMaxPercentTextSubstitute, 
            setMaxPercentCapitalization, setMaxPercentSpeaker, setMaxPercentTag,
            setThresholdPunc, setThresholdTextDelete, setThresholdTextInsert, setThresholdTextSubstitute, 
            setThresholdCapitalization, setThresholdSpeaker, setThresholdTag}}
        />
      </div>
      <div className="spot-transcript">
        <h3>Transcript</h3>
        <h4>Key</h4>
        <SpotKey />
        <Transcript
          paragraphs={paragraphs}
          seekVideo={seekVideo}
          spots={spots}
        />
      </div>
    </div>
  );
}

EditJob.propTypes = {
  data: PropTypes.arrayOf(
    mergedPredictionDataShape
  ),
  video: PropTypes.shape({
    url: PropTypes.string,
  })
};

export default EditJob;
