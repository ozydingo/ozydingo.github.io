// Transition -- Easy enter / exit transitions in React
//
// Usage:
// <Transition in={true|false}>
//   ... your components here
// </Transiion>
//
// Child components will be rendered inside a <div> that will transition from
// "initial" to "middle" states when `in` goes from false to true, and from
// "middle" to "final" when `in` goes from true to false.
//
// Attach css transitions to these classes for maximal effect!
//
// Properties:
//
// in (bool) -- main toggle for component
// base -- class applied to root <div> at all times
// initial -- class applied prior to "in"
// middle -- class applied when `in` is `true`
// final -- class applied after `in` is set to `false`.
// unmount -- Use `true` to unmount the component outside of transitions when !in

import React, { useEffect, useRef, useState } from "react";

import PropTypes from "prop-types";

// Generate a unique key to cause React to render a component as new.
// This can be used to instantly shift from "final" to "middle" states without
// transition.
function getKey() {
  return `${new Date().getTime()}-${Math.random()}`;
}

function hasTransition(element) {
  if (!element) { return false; }

  const transition = window.getComputedStyle(element).getPropertyValue("transition");
  return transition !== "all 0s ease 0s";
}

function Transition(props) {
  const root = useRef(null);

  const [active, setActive] = useState(props.in);
  const [key, setKey] = useState(getKey());
  const [styleState, setStyleState] = useState(props.in ? "middle" : "initial");

  function breakTransition() {
    setKey(getKey());
  }

  function waxOn() {
    setActive(true);
    // Paint the current state before "middle" to ensure css transition.
    window.requestAnimationFrame(() => setStyleState("middle"));
  }

  function waxOff() {
    if (hasTransition(root.current)) {
      // Set `active` to `false` after final transition
      root.current.ontransitionend = () => {
        root.current.ontransitionend = null;
        setActive(false);
      };
    } else {
      setActive(false);
    }

    setStyleState("final");
  }

  useEffect(() => {
    if (props.in && styleState === "initial") {
      waxOn();
    } else if (props.in && styleState === "final") {
      breakTransition();
      setStyleState("initial");
      waxOn();
    } else if (!props.in && styleState === "middle") {
      waxOff();
    }
  }, [styleState, props.in]);

  if (props.unmount && !active) { return null; }

  const className = (props.base || "") + " " + (props[styleState] || "");
  return (
    <div ref={root} key={key} className={className}>
      {props.children}
    </div>
  );
}

Transition.propTypes = {
  children: PropTypes.node,
  in: PropTypes.bool,
  base: PropTypes.string,
  initial: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  middle: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  final: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  unmount: PropTypes.bool,
};

export default Transition;
