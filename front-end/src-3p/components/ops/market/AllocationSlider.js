import React from "react";

import PropTypes from "prop-types";

import Form from "react-bootstrap/Form";

function asPercent(frac) {
  const pct = Math.round(frac * 100);
  return `${pct}%`;
}

function AllocationSlider(props) {
  return (
    <Form.Group className="m-0">
      <Form.Control
        disabled={props.disabled}
        type="range"
        onChange={props.onChange}
        min={0}
        max={1}
        step={0.01}
        value={props.allocation}
      />
      <Form.Label>{asPercent(props.allocation)}</Form.Label>
    </Form.Group>
  );
}

AllocationSlider.propTypes = {
  allocation: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export default AllocationSlider;
