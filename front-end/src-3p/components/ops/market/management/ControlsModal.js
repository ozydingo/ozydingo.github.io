import React from "react";

import {css, StyleSheet} from "aphrodite";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/Modal";

import { marketManagementControlShape } from "components/ops/market/shapes";

import ControlGroupSettings from "./ControlGroupSettings";

function ControlsModal(props) {
  function close() {
    props.setShow(false);
  }

  return (
    <Modal show={props.show} onHide={close} size="lg" scrollable>
      <Modal.Header closeButton>
        Modify Market Management Settings
      </Modal.Header>
      <Modal.Body>
        <div className={css(styles.modalBody)}>
          {props.selectors}
          <hr />
          <ControlGroupSettings
            controlsList={props.controlsList}
            removeControlOverride={props.removeControlOverride}
            updateControlValue={props.updateControlValue}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}

ControlsModal.propTypes = {
  show: PropTypes.bool,
  setShow: PropTypes.func,
  selectors: PropTypes.node,
  controlsList: PropTypes.arrayOf(
    marketManagementControlShape
  ),
  removeControlOverride: PropTypes.func.isRequired,
  updateControlValue: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  modalBody: {
    maxHeight: "70vh",
    overflowY: "scroll",
  }
});

export default ControlsModal;
