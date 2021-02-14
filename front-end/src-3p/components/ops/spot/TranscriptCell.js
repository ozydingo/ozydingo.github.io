import React, { useMemo } from "react";
import PropTypes from "prop-types";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import Cells from "./cells";
import CellTooltip from "./CellTooltip";

import { mergedPredictionDataShape, spotNameShape } from "./shapes";

function TranscriptCell(props) {
  const cell = props.cell || {};
  const actual = cell.actual || {};
  const spotNames = props.spotNames || [];

  const displayText = useMemo(() => {
    return Cells.parseCell(actual.final).text;
  }, actual);

  const isEdited = actual.post_asr !== actual.edited;
  const isModified = actual.post_asr !== actual.final;
  const isSpotted = spotNames.length > 0;

  let className = "spot-cell";
  if (isEdited) {
    className += " spot-cell-edited";
  } else if (isModified) {
    className += " spot-cell-modified";
  }

  if (isSpotted && isEdited) {
    className += " spot-redundant";
  } else if (isSpotted && isModified) {
    className += " spot-detection";
  } else if (isSpotted) {
    className += " spot-false-alarm";
  }

  if (isModified) {
    className += " spot-cell-error";
  }
  if (isSpotted) {
    if (isEdited) {
      className += " spot-redundant";
    } else if (isModified) {
      className += " spot-detection";
    } else {
      className += " spot-false-alarm";
    }
  }

  const cellContents = (
    <span data-timestamp={actual.time} className={className} onClick={handleCellClick}>
      {displayText}
      {" "}
    </span>
  );

  function handleCellClick(event) {
    const timestamp = event.currentTarget.getAttribute("data-timestamp");
    const ms = Number(timestamp) / 10;
    props.seekVideo(ms);
  }

  if (isEdited || isModified || isSpotted) {
    return (
      <OverlayTrigger
        placement="auto"
        overlay={(
          <Tooltip>
            <CellTooltip cell={cell} spotNames={spotNames} />
          </Tooltip>
        )}
      >
        {cellContents}
      </OverlayTrigger>
    );
  } else {
    return cellContents;
  }
}

TranscriptCell.propTypes = {
  cell: mergedPredictionDataShape,
  spotNames: PropTypes.arrayOf(spotNameShape),
};

export default TranscriptCell;
