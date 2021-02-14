// InNOut -- wrapper component around Transition for easy in-and-out components
//
// The children components will be transitioned between in and out styles automatically
// any time the `displayKey` value is changed.
//
// Usage:
// <InNOut displayKey={value}>
//   ... your components here
// </InNOut>
//
// Properties:
// - displayKey: the icon will display with animation every time this value is changed.
//   A timestamp or changing object id are good keys to use.
// - stayOnDuration (ms): How long to stay in the "in" state on each displayKey
//   change. Default: 3000.
// See <Transition> for other properties.

import React, { useEffect, useState } from "react";

import PropTypes from "prop-types";

import Transition from "./Transition";

function InNOut(props) {
  const [show, setShow] = useState(false);
  const [hideItTimer, setHideItTimer] = useState(null);

  useEffect(() => {
    if (!props.displayKey) { return; }

    if (hideItTimer) { clearTimeout(timer); }
    setShow(true);
    const timer = setTimeout(() => setShow(false), props.stayOnDuration);
    setHideItTimer(timer);
  }, [props.displayKey]);

  return (
    <Transition in={show} {...props}>
      {props.children}
    </Transition>
  );
}

InNOut.propTypes = {
  children: PropTypes.node,
  displayKey: PropTypes.any,
  stayOnDuration: PropTypes.number,
};

InNOut.defaultProps = {
  stayOnDuration: 3000
};

export default InNOut;
