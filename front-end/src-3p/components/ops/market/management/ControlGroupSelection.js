import React from "react";

import PropTypes from "prop-types";

import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { contractorGroupShape, jobTypeShape } from "components/ops/common/shapes";

function ControlGroupSelection(props) {
  const contractorGroups = props.contractorGroups || [];
  const jobTypes = props.jobTypes || [];

  const nullContractorGroup = {
    id: "",
    name: "Default"
  };
  const nullJobType = {
    id: "",
    fullName: "Default"
  };

  function handleContractorGroup(event) {
    const value = event.target.value === "" ? null : Number(event.target.value);
    props.setContractorGroupId(value);
  }

  function handleJobType(event) {
    const value = event.target.value === "" ? null : Number(event.target.value);
    props.setJobTypeId(value);
  }

  function whatGetsModified() {
    if (props.jobTypeId === null && props.contractorGroupId === null) {
      return "all jobs types and contractor groups";
    } else if (props.jobTypeId === null) {
      const contractorGroup = contractorGroups.find(obj => obj.id === props.contractorGroupId);
      return `all job types for ${contractorGroup ? contractorGroup.name : "this contractor group"}`;
    } else if (props.contractorGroupId === null) {
      const jobType = jobTypes.find(obj => obj.id === props.jobTypeId);
      return `all contractor groups for ${jobType ? jobType.fullName : "this job type"}`;
    } else {
      return "";
    }
  }

  return (
    <Form>
      <Form.Row>
        <Col>
          <Form.Group controlId="marketControlSelection.jobTypeId">
            <Form.Label>Job Type</Form.Label>
            <Form.Control as="select" value={props.jobTypeId || ""} onChange={handleJobType}>
              {([nullJobType].concat(jobTypes)).map(jobType => (
                <option key={jobType.id} value={jobType.id}>{jobType.fullName}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="marketControlSelection.contractorGroupId">
            <Form.Label>Contractor Group</Form.Label>
            <Form.Control as="select" value={props.contractorGroupId || ""} onChange={handleContractorGroup}>
              {([nullContractorGroup].concat(contractorGroups)).map(contractorGroup => (
                <option key={contractorGroup.id} value={contractorGroup.id}>{contractorGroup.name}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Form.Row>
      {(props.jobTypeId === null || props.contractorGroupId === null) && (
        <Alert variant="warning">
          <strong>Note:</strong> You are current modifying settings for {whatGetsModified()}.
          Any groups that have not been modified from their default values will inherit these changes.
        </Alert>
      )}
    </Form>
  );
}

ControlGroupSelection.propTypes = {
  contractorGroups: PropTypes.arrayOf(contractorGroupShape),
  jobTypeId: PropTypes.number,
  jobTypes: PropTypes.arrayOf(jobTypeShape),
  setJobTypeId: PropTypes.func.isRequired,
  contractorGroupId: PropTypes.number,
  setContractorGroupId: PropTypes.func.isRequired,
};

export default ControlGroupSelection;
