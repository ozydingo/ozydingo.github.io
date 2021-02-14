import React, { useMemo } from "react";

import PropTypes from "prop-types";

import Table from "react-bootstrap/Table";

import { contractorGroupShape, jobTypeShape } from "components/ops/common/shapes";
import { marketManagementControlShape } from "components/ops/market/shapes";

import CellSettingsOverlay from "./CellSettingsOverlay";
import ManagementMatrixCell from "./ManagementMatrixCell";

function pct(fraction) {
  return String(Math.round(fraction * 100));
}

function controlMatrixIndex(control) {
  return `${control.controlType}:${control.jobTypeId}:${control.contractorGroupId}`;
}

function indexControlMatrix(controlMatrix) {
  const indexed = {};
  controlMatrix.forEach(control => {
    indexed[controlMatrixIndex(control)] = control;
  });
  return indexed;
}

function ManagementMatrix(props) {
  // useEffect(() => console.log(JSON.stringify({jobTypes: props.jobTypes})), [props.jobTypes]);
  const indexedControls = useMemo(() => {
    return indexControlMatrix(props.controlMatrix);
  }, [props.controlMatrix]);

  function controlFor(controlType, {jobTypeId, contractorGroupId}) {
    const index = controlMatrixIndex({controlType, jobTypeId, contractorGroupId});
    const control = indexedControls[index];
    return control;
  }

  function labeledControlsFor({jobTypeId, contractorGroupId}) {
    return {
      total_hour_target: controlFor("total_hour_target", {jobTypeId, contractorGroupId}),
      project_cap: controlFor("project_cap", {jobTypeId, contractorGroupId}),
      deadline_distribution: controlFor("deadline_distribution", {jobTypeId, contractorGroupId}),
    };
  }

  function displayAsOverridden(control) {
    return control && (control.jobTypeId || control.contractorGroupId) && !control.inherited;
  }

  function cellDisplayData({jobTypeId, contractorGroupId}) {
    const controls = labeledControlsFor({jobTypeId, contractorGroupId});
    const overriden = displayAsOverridden(controls.total_hour_target)
      || displayAsOverridden(controls.project_cap)
      || displayAsOverridden(controls.deadline_distribution);
    const total_hour_target = controls.total_hour_target && controls.total_hour_target.controlValue;
    const project_cap = controls.project_cap && controls.project_cap.controlValue;
    return {
      total_hour_target,
      total_hour_target_overridden: displayAsOverridden(controls.total_hour_target),
      project_cap,
      project_cap_overridden: displayAsOverridden(controls.project_cap),
      overriden,
    };
  }

  function cellStats(displayData) {
    return (
      <>
        {displayData.total_hour_target}&nbsp;hrs&nbsp;{displayData.total_hour_target_overridden && "*"}
        <br />
        &lt; {pct(displayData.project_cap)}%&nbsp;{displayData.project_cap_overridden && "*"}
      </>
    );
  }

  const globalDefaultDisplayData = cellDisplayData({jobTypeId: null, contractorGroupId: null});
  return (
    <Table responsive bordered>
      <thead>
        <tr>
          <th className="border-0 align-bottom">
            <strong>Contractor Group</strong>
          </th>
          {props.jobTypes.map(jobType => (
            <ManagementMatrixCell key={jobType.id} hideX={!jobType.display} header>
              <strong>{jobType.fullName}</strong>
            </ManagementMatrixCell>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <ManagementMatrixCell variant="default">
            <CellSettingsOverlay enter={() => props.openControls({jobTypeId: null, contractorGroupId: null})}/>
            <strong>Default</strong>
            <br />
            {cellStats(globalDefaultDisplayData)}
          </ManagementMatrixCell>
          {props.jobTypes.map(jobType => {
            const displayData = cellDisplayData({jobTypeId: jobType.id, contractorGroupId: null});
            return (
              <ManagementMatrixCell key={jobType.id} hideX={!jobType.display} variant={displayData.overriden ? "modified" : "default" }>
                <CellSettingsOverlay enter={() => props.openControls({jobTypeId: jobType.id, contractorGroupId: null})}/>
                {cellStats(displayData)}
              </ManagementMatrixCell>
            );
          })}
        </tr>
        {props.contractorGroups.map(group => {
          const groupDefaultDisplayData = cellDisplayData({jobTypeId: null, contractorGroupId: group.id});
          return (
            <tr key={group.id}>
              <ManagementMatrixCell hideY={!group.display} variant={groupDefaultDisplayData.overriden ? "modified" : null }>
                <CellSettingsOverlay enter={() => props.openControls({jobTypeId: null, contractorGroupId: group.id})}/>
                <strong>{group.name}</strong>
                <br />
                {cellStats(groupDefaultDisplayData)}
              </ManagementMatrixCell>
              {props.jobTypes.map(jobType => {
                const displayData = cellDisplayData({jobTypeId: jobType.id, contractorGroupId: group.id});
                return (
                  <ManagementMatrixCell key={jobType.id} hideX={!jobType.display} hideY={!group.display} variant={displayData.overriden ? "modified" : null }>
                    <CellSettingsOverlay enter={() => props.openControls({jobTypeId: jobType.id, contractorGroupId: group.id})}/>
                    {cellStats(displayData)}
                  </ManagementMatrixCell>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

ManagementMatrix.propTypes = {
  contractorGroups: PropTypes.arrayOf(contractorGroupShape),
  jobTypes: PropTypes.arrayOf(jobTypeShape),
  openControls: PropTypes.func,
  controlMatrix: PropTypes.arrayOf(marketManagementControlShape),
};

export default ManagementMatrix;
