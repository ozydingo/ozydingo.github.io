import React from "react";

import { css, StyleSheet } from "aphrodite";
import PropTypes from "prop-types";

const th = props => <th {...props} />;
const td = props => <td {...props} />;

function ManagementMatrixCell(props) {
  const variant = props.variant || "main";
  const Element = props.header ? th : td;

  return (
    <Element
      className={css(
        styles.cell,
        props.hideX && styles.hiddenX,
        props.hideY && styles.hiddenY,
        props.header && styles.header,
        styles[variant]
      )}
    >
      {props.children}
    </Element>
  );
}

ManagementMatrixCell.propTypes = {
  children: PropTypes.node,
  hideX: PropTypes.bool,
  hideY: PropTypes.bool,
  header: PropTypes.bool,
  variant: PropTypes.oneOf([
    "default",
    "modified",
    "requiresAction",
  ])
};

const styles = StyleSheet.create({
  cell: {
    maxWidth: "80px",
    position: "relative",
    transition: "opacity, max-width, max-height, line-height, padding",
    transitionDuration: "0.1s",
    textAlign: "center",
    verticalAlign: "middle",
  },
  main: {
    backgroundColor: "#ffffff",
  },
  default: {
    backgroundColor: "#f2f2f2",
  },
  header: {
    backgroundColor: "#f2f2f2",
  },
  hiddenX: {
    transitionDelay: "0.1s",
    transitionDuration: "0.2s",
    opacity: "0",
    maxWidth: "0",
    overflow: "hidden",
    padding: "0",
  },
  hiddenY: {
    transitionDelay: "0.1s",
    transitionDuration: "0.2s",
    opacity: "0",
    maxHeight: "0",
    lineHeight: "0",
    overflow: "hidden",
    padding: "0",
  },
  modified: {
    backgroundColor: "#fff5C0",
  },
  requiresActions: {
    backgroundColor: "#ffe3e3",
  },
});

export default ManagementMatrixCell;
