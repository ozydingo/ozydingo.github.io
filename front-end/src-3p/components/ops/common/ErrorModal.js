// Simple, OK-button-dismissed error modal

import React from "react";

import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function ErrorModal(props) {
  return (
    <Modal show={props.show}>
      <Modal.Header>
        {props.title}
      </Modal.Header>
      <Modal.Body>
        {props.children}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onAcknowledge}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ErrorModal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  onAcknowledge: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

ErrorModal.defaultProps = {
  title: "Oh No!",
};


export default ErrorModal;
