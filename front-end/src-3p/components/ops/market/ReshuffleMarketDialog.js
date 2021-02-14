import React, { useState } from "react";

import PropTypes from "prop-types";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { threeplayApi } from "components/ops/common/threeplayApi";

import { resaltSubmarketsMutation } from "./mutations";

function ReshuffleMarketDialog(props) {
  const [working, setWorking] = useState(false);

  async function reshuffle() {
    setWorking(true);
    const data = new FormData();
    data.append("authenticity_token", props.csrfToken);
    const response = await threeplayApi.json(resaltSubmarketsMutation);
    if (response.data && response.data.resaltSubmarkets && response.data.resaltSubmarkets.success) {
      props.onCancel();
      props.onSubmit();
    } else {
      console.error(response); //eslint-disable-line no-console
    }
    // TODO: prevent state update when unmounted
    setWorking(false);
  }

  return (
    <Modal
      show={props.show}
      onHide={() => props.onCancel()}
    >
      <Modal.Header closeButton>
        <Modal.Title>Reshuffle Markets</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          Reshuffle all randomized contractor submarket assignments?
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-flex-end">
        <div>
          <Button className="mr-2" variant="outline-dark" onClick={props.onCancel}>
            Cancel
          </Button>
          {working ? (
            <Button
              disabled
              variant="danger"
            >
              Working...
            </Button>
          ) : (
            <Button
              onClick={reshuffle}
              variant="danger"
            >
              Yes, reshuffle!
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

ReshuffleMarketDialog.propTypes = {
  csrfToken: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default ReshuffleMarketDialog;
