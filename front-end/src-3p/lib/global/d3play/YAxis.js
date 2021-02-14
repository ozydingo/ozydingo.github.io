import React from "react";

import PropTypes from "prop-types";

function YAxis(props) {
  return (
    <g transform={`translate(0, ${props.labelY})`}>
      <text
        data-role="axis-label"
        fill="currentColor"
        transform="rotate(-90)"
        textAnchor="end"
        y={props.labelX} // it's rotated 90 degrees
      >
        {props.children}
      </text>
    </g>
  );
}

YAxis.propTypes = {
  children: PropTypes.node,
  labelX: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  labelY: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
};

YAxis.defaultProps = {
  labelX: "1.2em",
  labelY: 0,
};

export default YAxis;
