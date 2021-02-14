import React from "react";

import PropTypes from "prop-types";

function XAxis(props) {
  return (
    <text
      data-role="axis-label"
      fill="currentColor"
      textAnchor="end"
      x={props.labelX}
      y={props.labelY}
    >
      {props.children}
    </text>
  );
}

XAxis.propTypes = {
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

XAxis.defaultProps = {
  labelX: 0,
  labelY: "2.5em",
};

export default XAxis;
