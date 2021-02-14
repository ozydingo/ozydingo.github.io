import React from "react";

import PropTypes from "prop-types";

import Cells from "./cells";

import { mergedPredictionDataShape, spotNameShape } from "./shapes";

function CellTooltip(props) {
  const cell = props.cell || {};
  const actual = cell.actual || {};
  const isEdited = actual.post_asr !== actual.edited;
  const isModified = actual.post_asr !== actual.final;

  return (
    <table className="spot-cellTooltipTable">
      <tbody>
        {(isEdited || isModified) && (
          <tr>
            <td>
              ASR
            </td>
            <td>
              {Cells.parseCell(actual.post_asr).text}
            </td>
          </tr>
        )}
        {isEdited && (
          <tr>
            <td>
              Edited
            </td>
            <td>
              {Cells.parseCell(actual.edited).text}
            </td>
          </tr>
        )}
        {(isEdited || isModified) && (
          <tr>
            <td>
              Final
            </td>
            <td>
              {Cells.parseCell(actual.final).text}
            </td>
          </tr>
        )}
        {props.spotNames.map(({ name, score }) => (
          <tr key={name}>
            <td>{name}</td>
            <td>{Math.round(100 * score) / 100}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

CellTooltip.propTypes = {
  cell: mergedPredictionDataShape.isRequired,
  spotNames: PropTypes.arrayOf(spotNameShape).isRequired,
};

export default CellTooltip;
