import React, { useEffect, useMemo, useState } from "react";

import { css, StyleSheet } from "aphrodite";
import PropTypes from "prop-types";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import SlideCheck from "lib/global/animations/SlideCheck";

import { marketManagementControlShape } from "components/ops/market/shapes";

function hoursBoundaryLabel(hours) {
  if (hours === null) {
    return "*";
  } else {
    return String(hours);
  }
}

function pct(fraction) {
  return String(Math.round(fraction * 100));
}

function round(num, precision) {
  return Math.round(num * 10 ** precision) / 10 ** precision;
}

function computeTotalDistribution(deadlineDistribution) {
  const total = deadlineDistribution.reduce((sum, next) => (sum + next.target), 0);
  return Math.round(total * 100) / 100;
}

const confirmIcon = (<i className="fa fa-check text-success" />);
const failedIcon = (<i className="fa fa-times text-danger" />);

function ControlGroupSetting(props) {
  // Get a control object from the list
  function controlsListItem(controlType) {
    if (!props.controlsList) { return null; }
    return props.controlsList.find(control => control.controlType === controlType);
  }

  // Get the control object's parsed value and inheritance
  function parsedControlListItem(controlType) {
    const control = controlsListItem(controlType) || {};
    const controlValue = control.controlValue && JSON.parse(control.controlValue);
    const parsedControl = {...control, controlValue};
    return parsedControl;
  }

  // Store control values from props as persisted values
  const persistedTotalHourTarget = useMemo(() => parsedControlListItem("total_hour_target"), [props.controlsList]);
  const persistedProjectCap = useMemo(() => parsedControlListItem("project_cap"), [props.controlsList]);
  const persistedDeadlineDistribution = useMemo(() => parsedControlListItem("deadline_distribution"), [props.controlsList]);

  // Control form input values with state using default values from props-derived persisted value
  const [inputTotalHourTarget, setInputTotalHourTarget] = useState("");
  const [inputProjectCap, setInputProjectCap] = useState("");
  const [proposedDeadlineDistribution, setProposedDeadlineDistribution] = useState([]);

  // Store typed data for each state value
  const proposedTotalHourTarget = Number(inputTotalHourTarget);
  const proposedProjectCap = Number(inputProjectCap) / 100;

  // Keep track of what's been modified
  const totalHourTargetModified = proposedTotalHourTarget !== persistedTotalHourTarget.controlValue;
  const projectCapModified = proposedProjectCap !== persistedProjectCap.controlValue;
  const deadlineDistributionModified = proposedDeadlineDistribution !== persistedDeadlineDistribution.controlValue;
  const anyModified = totalHourTargetModified || projectCapModified || deadlineDistributionModified;

  // Allow reseting to original/persisted values
  function resetInputTotalHourTarget() {
    setInputTotalHourTarget(persistedTotalHourTarget && persistedTotalHourTarget.controlValue || "");
  }
  function resetInputProjectCap() {
    setInputProjectCap(persistedProjectCap && pct(persistedProjectCap.controlValue) || "");
  }
  function resetProposedDeadlineDistribution() {
    setProposedDeadlineDistribution(persistedDeadlineDistribution && persistedDeadlineDistribution.controlValue || []);
  }

  // Resync from default state if props change
  useEffect(resetInputTotalHourTarget, [persistedTotalHourTarget]);
  useEffect(resetInputProjectCap, [persistedProjectCap]);
  useEffect(resetProposedDeadlineDistribution, [persistedDeadlineDistribution]);

  const [errors, setErrors] = useState([]);
  const [confirmations, setConfirmations] = useState({});

  const totalDistribution = useMemo(() => computeTotalDistribution(proposedDeadlineDistribution), [proposedDeadlineDistribution]);
  const allValuesValid = Math.round(totalDistribution * 100) === 100;

  // Return a unique value to cause the confirmation to re-render
  function confirmationKey(type) {
    return confirmations[type] && confirmations[type].key;
  }

  function save() {
    if (totalHourTargetModified) { submitControlValue("total_hour_target", proposedTotalHourTarget); }
    if (projectCapModified) { submitControlValue("project_cap", proposedProjectCap); }
    if (deadlineDistributionModified) { submitControlValue("deadline_distribution", proposedDeadlineDistribution); }
  }

  function reset() {
    resetInputTotalHourTarget();
    resetInputProjectCap();
    resetProposedDeadlineDistribution();
  }

  // Update the control value at the server, then update the UI
  async function submitControlValue(type, value) {
    const response = await props.updateControlValue({
      controlType: type,
      controlValue: value,
    });
    const errors = response.errors ? response.errors.map(err => err.message) : response.data.marketManagementControl.errors;
    confirmMutationResult({type, errors});
  }

  // Delete the control override at the server, update the UI
  async function removeControlOverride(control) {
    const response = await props.removeControlOverride(control.id);
    const errors = response.errors ? response.errors.map(err => err.message) : response.data.deleteMarketManagementControl.errors;
    confirmMutationResult({type: control.controlType, errors});
  }

  // Standardized handling of a completed update or delete action for a control
  function confirmMutationResult({type, errors}) {
    const confirmation = {
      key: new Date().getTime(),
      success: !errors,
    };
    setConfirmations({...confirmations, [type]: confirmation});
    if (errors) {
      setErrors(errors);
    }
  }

  function handleTotalHourTarget(event) {
    setInputTotalHourTarget(event.target.value);
  }

  function handleProjectCap(event) {
    setInputProjectCap(event.target.value);
  }

  function handleDeadlineDistribution(event, ii) {
    const newDistribution = proposeDistribuionChange(ii, Number(event.target.value) / 100);
    setProposedDeadlineDistribution(newDistribution);
  }

  // Return a new distribution given the proposed change bounded to total 100%
  function proposeDistribuionChange(ii, newTarget) {
    const newDistribution = proposedDeadlineDistribution.slice(); // allocate new object
    newDistribution[ii] = {...newDistribution[ii], target: newTarget};
    const totalDistribution = computeTotalDistribution(newDistribution);
    if (totalDistribution > 1) {
      const overage = totalDistribution - 1;
      newDistribution[ii].target = Math.round(100 * (newDistribution[ii].target - overage)) / 100;
    }
    return newDistribution;
  }

  function dismissError(ii) {
    const newErrors = errors.slice();
    newErrors.splice(ii, 1);
    setErrors(newErrors);
  }

  function trashButton(control) {
    return !control.inherited && (control.jobTypeId || control.contractorGroupId) && (
      <Button variant="outline-secondary" onClick={() => removeControlOverride(control)}>
        <i className="fa fa-trash" />
      </Button>
    );
  }

  function confirmationIcon(type) {
    return (
      <SlideCheck displayKey={confirmationKey(type)}>
        {confirmations[type] && (confirmations[type].success ? confirmIcon : failedIcon)}
      </SlideCheck>
    );
  }

  return (
    <Form>
      {errors && errors.map((err, ii) => (
        <Alert key={ii} variant="danger" dismissible onClose={() => dismissError(ii)}>{err}</Alert>
      ))}

      <Form.Row>
        {/* Total Hour Target (text) */}
        <Form.Group as={Col} controlId="marketControlSettings.totalDurationTarget">
          <div className="float-right">{trashButton(persistedTotalHourTarget)}</div>
          <Form.Label>
            {totalHourTargetModified && "*"}
            Total duration target
          </Form.Label>
          <Form.Text muted>
            We will attempt to release this many hours to each users market.
          </Form.Text>
          <InputGroup>
            <Form.Control
              type="text"
              value={inputTotalHourTarget}
              onChange={handleTotalHourTarget}
            />
            <InputGroup.Append>
              <InputGroup.Text>hrs</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
          <div>{confirmationIcon("total_hour_target")}</div>
        </Form.Group>

        {/* Project Cap (text) */}
        <Form.Group as={Col} controlId="marketControlSettings.projectCap">
          <div className="float-right">{trashButton(persistedProjectCap)}</div>
          <Form.Label>
            {projectCapModified && "*"}
            Project cap
          </Form.Label>
          <Form.Text muted>
            No project will take up more than this percentage of a user&apos;s available jobs, unless no other jobs are available.
          </Form.Text>
          <InputGroup>
            <Form.Control
              type="text"
              value={inputProjectCap}
              onChange={handleProjectCap}
            />
            <InputGroup.Append>
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
          <div>{confirmationIcon("project_cap")}</div>
        </Form.Group>
      </Form.Row>

      {/* Deadline Distribution (sliders) */}
      <div>
        <div className="float-right">{trashButton(persistedDeadlineDistribution)}</div>
        <Form.Label>
          {deadlineDistributionModified && "*"}
          Deadline Distribution
        </Form.Label>
        <Form.Text muted>
          We will attempt to release jobs with matching time-to-deadline matching this distribution.
        </Form.Text>
        {proposedDeadlineDistribution.map(({name, target, start_hours, end_hours}, ii) => (
          <Form.Group key={ii} as={Form.Row} controlId={`marketControlSettings.deadlineDistributionTarget${ii}`}>
            <Col lg={2} className="d-flex align-items-center">
              <Form.Label>
                {name}
                <Form.Text className="m-0">{hoursBoundaryLabel(start_hours)} - {hoursBoundaryLabel(end_hours)} hours</Form.Text>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-center">
              <Form.Control
                type="range"
                value={pct(target)}
                min={0}
                max={100}
                onChange={(event) => handleDeadlineDistribution(event, ii)}
              />
            </Col>
            <Col xs="auto">{confirmationIcon("deadline_distribution")}</Col>
            <Col lg={2} className="d-flex align-items-center">
              <InputGroup>
                <Form.Control
                  type="text"
                  value={pct(target)}
                  onChange={(event) => handleDeadlineDistribution(event, ii)}
                />
                <InputGroup.Append>
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Col>
            <Col lg={1} className="d-flex align-items-center">
              {round(target * proposedTotalHourTarget, 1)} hrs
            </Col>
          </Form.Group>
        ))}

        {/* Totals for Deadline Distribution */}
        <Form.Group as={Form.Row} controlId={`marketControlSettings.deadlineDistributionTarget.total`}>
          <Col lg={2} className="d-flex align-items-center">
            <Form.Label>Total</Form.Label>
          </Col>
          <Col></Col>
          <Col xs="auto"></Col>
          <Col lg={2} className="d-flex justify-content-end">
            <Form.Label>{pct(totalDistribution)}%</Form.Label>
          </Col>
          <Col lg={1}>
            <Form.Label>{proposedTotalHourTarget} hrs</Form.Label>
          </Col>
        </Form.Group>
      </div>

      <Form.Row className={css(styles.fakeFooter)}>
        <Col className="d-flex justify-content-end">
          <Button className="ml-1" variant="outline-secondary" disabled={!anyModified} onClick={reset}>
            Discard Changes
          </Button>
          <Button className="ml-1" variant="primary" disabled={!(anyModified && allValuesValid)} onClick={save}>
            Save Changes
          </Button>
        </Col>
      </Form.Row>
    </Form>
  );
}

ControlGroupSetting.propTypes = {
  controlsList: PropTypes.arrayOf(marketManagementControlShape),
  removeControlOverride: PropTypes.func.isRequired,
  updateControlValue: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  fakeFooter: {
    position: "sticky",
    bottom: 0,
    backgroundColor: "#ffffff",
    paddingTop: "0.5em",
  }
});

export default ControlGroupSetting;
