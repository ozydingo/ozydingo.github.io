import React from "react";

import PropTypes from "prop-types";

import ModalErrorBoundary from "components/ops/common/ModalErrorBoundary";

function Modals(props) {
  if (!props.children) { return; }

  if (Symbol.iterator in Object(props.children)) {
    return (
      <>
        {props.children.map((child, ii) => (
          <ModalErrorBoundary key={ii}>
            {child}
          </ModalErrorBoundary>
        ))}
      </>
    );
  } else {
    return (
      <ModalErrorBoundary>
        {props.children}
      </ModalErrorBoundary>
    );
  }
}

Modals.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default Modals;
