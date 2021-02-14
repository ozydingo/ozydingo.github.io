import React, { useState } from "react";

import PropTypes from "prop-types";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

function NewRuleDiialog(props) {
  const [name, setName] = useState("New Rule");
  const [description, setDescription] = useState("A new rule!");
  const [filter, setFilter] = useState("{}");

  const ruleAttributes = {name, description, entityType: props.entityType, filter};

  function handleName(event) {
    setName(event.target.value);
  }

  function handleDescription(event) {
    setDescription(event.target.value);
  }

  function handleFilter(event) {
    setFilter(event.target.value);
  }


  return (
    <Modal
      show={props.show}
      onHide={props.onCancel}
    >
      <Modal.Header closeButton>
        <Modal.Title>New Rule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="ruleName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" value={name} onChange={handleName}></Form.Control>
          </Form.Group>
          <Form.Group controlId="ruleDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" value={description} onChange={handleDescription}></Form.Control>
          </Form.Group>
          <Form.Group controlId="ruleEntityType">
            <Form.Label>Type</Form.Label>
            <Form.Control type="text" value={props.entityType} readOnly></Form.Control>
          </Form.Group>
          <Form.Group controlId="ruleFilter">
            <Form.Label>Filter (JSON)</Form.Label>
            <Form.Control type="text" value={filter} onChange={handleFilter}></Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-flex-end">
        <div>
          <Button className="mr-2" variant="outline-dark" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button onClick={() => props.onSubmit(ruleAttributes)} >
            Add
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

NewRuleDiialog.propTypes = {
  entityType: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default NewRuleDiialog;
