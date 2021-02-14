import React from "react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { contractorGroupShape, jobTypeShape } from "components/ops/common/shapes";

function GroupFilters(props) {
  const { jobTypes, contractorGroups } = props;

  function handleJobTypes(event) {
    const values = Array.from(event.target.selectedOptions, option => Number(option.value));
    props.setSelectedJobTypes(values);
  }

  function handleContractorGroups(event) {
    const values = Array.from(event.target.selectedOptions, option => Number(option.value));
    props.setSelectedContractorGroups(values);
  }

  function selectAllJobTypes() {
    props.setSelectedJobTypes(jobTypes.map(x => x.id));
  }

  function selectAllContractorGroups() {
    props.setSelectedContractorGroups(contractorGroups.map(x => x.id));
  }

  return (
    <Form>
      <Form.Row>
        <Col>
          <Form.Label>
            Filter by job type
            <Button variant="link" className="align-baseline" onClick={selectAllJobTypes}>(select all)</Button>
          </Form.Label>
          <Form.Control
            key={props.selectedJobTypes.toString() /*force re-render when values from props change*/}
            as="select"
            multiple
            defaultValue={props.selectedJobTypes}
            onBlur={handleJobTypes}
          >
            {jobTypes.map(jobType => (
              <option key={jobType.id} value={jobType.id}>{jobType.fullName}</option>
            ))}
          </Form.Control>
        </Col>
        <Col>
          <Form.Label>
            Filter by contractor group
            <Button variant="link" className="align-baseline" onClick={selectAllContractorGroups}>(select all)</Button>
          </Form.Label>
          <Form.Control
            key={props.selectedContractorGroups.toString() /*force re-render when values from props change*/}
            as="select"
            multiple
            defaultValue={props.selectedContractorGroups}
            onBlur={handleContractorGroups}
          >
            {contractorGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Form.Control>
        </Col>
      </Form.Row>
    </Form>
  );
}

GroupFilters.propTypes = {
  jobTypes: PropTypes.arrayOf(jobTypeShape),
  contractorGroups: PropTypes.arrayOf(contractorGroupShape),
  selectedJobTypes: PropTypes.arrayOf(PropTypes.number),
  setSelectedJobTypes: PropTypes.func.isRequired,
  selectedContractorGroups: PropTypes.arrayOf(PropTypes.number),
  setSelectedContractorGroups: PropTypes.func.isRequired,
};

export default GroupFilters;
