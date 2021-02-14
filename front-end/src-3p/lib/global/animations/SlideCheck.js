// SlideCheck -- animated font-awesome check (or custom component) with slide-in & out.
//
// The child component (checkmark by default) will fade & slide in from the bottom,
// then fade out and slide up. Use case for form confirmations to indicate success,
// or, with custom child conmponents, failure or other statuses.
//
// Usage:
// <SlideCheck displayKey={value}>
//   ... custom component optional here
// </SlideCheck>
//
// Properties:
// - displayKey: the icon will display with animation every time this value is changed.
//   A timestamp or changing object id are good keys to use.

import React from "react";

import { css, StyleSheet } from "aphrodite";
import PropTypes from "prop-types";

import InNOut from "./InNOut";

function SlideCheck(props) {
  return (
    <InNOut
      displayKey={props.displayKey}
      stayOnDuration={2500}
      base={css(styles.base)}
      initial={css(styles.initial)}
      middle={css(styles.middle)}
      final={css(styles.final)}
    >
      {props.children}
    </InNOut>
  );
}

SlideCheck.propTypes = {
  displayKey: PropTypes.any,
  children: PropTypes.node,
};

SlideCheck.defaultProps = {
  children: (<i className="fa fa-check text-success" />),
};

const styles = StyleSheet.create({
  base: {
    position: "relative",
    pointerEvents: "none",
    top: "0px",
    transitionProperty: "opacity top",
    transitionDuration: "200ms",
  },
  initial: {
    opacity: "0",
    top: "3em"
  },
  middle: {
    opacity: "1",
    top: "0em"
  },
  final: {
    opacity: "0",
    top: "-3em"
  },
});

export default SlideCheck;
