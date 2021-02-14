import React, { useEffect, useMemo, useState } from "react";

import ControlsModal from "./ControlsModal";
import GroupFilters from "./GroupFilters";
import ManagementMatrix from "./ManagementMatrix";

import { marketManagementControlMutation, deleteMarketManagementControlMutation } from "components/ops/market/mutations";
import { marketManagementControlMatrixQuery } from "components/ops/market/queries";
import { threeplayApi } from "components/ops/common/threeplayApi";

import ControlGroupSelection from "./ControlGroupSelection";
import Fetched from "lib/global/Fetched";
import ModalErrorBoundary from "components/ops/common/ModalErrorBoundary";
import useFetcher from "lib/global/useFetcher";

function getJobTypes() {
  return threeplayApi.json("query { jobTypes { id fullName } }");
}

function getContractorGroups() {
  return threeplayApi.json("query { contractorGroups { id name description } }");
}

async function getControlMatrix() {
  return threeplayApi.json(marketManagementControlMatrixQuery);
}

function submitMarketManagementControl({ controlType, controlValue, contractorGroupId, jobTypeId }) {
  return threeplayApi.json(
    marketManagementControlMutation,
    { controlType, controlValue, contractorGroupId, jobTypeId }
  );
}

function removeMarketManagementControl(id) {
  return threeplayApi.json(
    deleteMarketManagementControlMutation,
    { id }
  );
}

function MarketManagement() {
  const [contractorGroupId, setContractorGroupId] = useState(null);
  const [jobTypeId, setJobTypeId] = useState(null);
  const [matrixKey, setMatrixKey] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedContractorGroups, setSelectedContractorGroups] = useState([]);

  const jobTypes = useFetcher(getJobTypes);
  const contractorGroups = useFetcher(getContractorGroups);
  const controlMatrix = useFetcher(getControlMatrix, [matrixKey]);

  useEffect(() => {
    setSelectedJobTypes(jobTypes.response && jobTypes.response.data.jobTypes.map(j => j.id));
  }, [jobTypes.response]);

  useEffect(() => {
    setSelectedContractorGroups(contractorGroups.response && contractorGroups.response.data.contractorGroups.map(j => j.id));
  }, [contractorGroups.response]);

  const displayJobTypes = useMemo(() => {
    return selectedJobTypes && jobTypes.response && jobTypes.response.data.jobTypes.filter(jobType => {
      return selectedJobTypes.findIndex(x => x === jobType.id) > -1;
    }) || [];
  }, [jobTypes, selectedJobTypes]);

  const markedJobTypes = useMemo(() => {
    return selectedJobTypes && jobTypes.response && jobTypes.response.data.jobTypes.map(jobType => {
      const display = selectedJobTypes.findIndex(x => x === jobType.id) > -1;
      return {...jobType, display};
    }) || [];
  }, [jobTypes, selectedJobTypes]);

  const displayContractorGroups = useMemo(() => {
    return selectedContractorGroups && contractorGroups.response && contractorGroups.response.data.contractorGroups.filter(contractorGroup => {
      return selectedContractorGroups.findIndex(x => x === contractorGroup.id) > -1;
    }) || [];
  }, [contractorGroups, selectedContractorGroups]);

  const markedContractorGroups = useMemo(() => {
    return selectedContractorGroups && contractorGroups.response && contractorGroups.response.data.contractorGroups.map(jobType => {
      const display = selectedContractorGroups.findIndex(x => x === jobType.id) > -1;
      return {...jobType, display};
    }) || [];
  }, [contractorGroups, selectedContractorGroups]);

  const modalControlsList = useMemo(() => {
    if (!controlMatrix.response) { return []; }

    return controlMatrix.response.data.marketManagementControlMatrix.filter(control => {
      return control.jobTypeId === jobTypeId
        && control.contractorGroupId === contractorGroupId;
    });
  }, [jobTypeId, contractorGroupId, controlMatrix, controlMatrix.response]);

  // Use a unique timestamp to force a refresh of the entire control matrix
  // This guarantees any back-end control-defaults logic is obeyed on updates
  function updateMatrix() {
    setMatrixKey(new Date().getTime());
  }

  function updateControlValue({controlType, controlValue}) {
    const response = submitMarketManagementControl({
      controlType,
      controlValue: JSON.stringify(controlValue),
      contractorGroupId,
      jobTypeId
    });

    response.then(updateMatrix);
    return response;
  }

  function removeControlOverride(controlId) {
    const response = removeMarketManagementControl(controlId);
    response.then(updateMatrix);
    return response;
  }

  function openControls({jobTypeId, contractorGroupId}) {
    // TODO: deal with control data loading
    setJobTypeId(jobTypeId);
    setContractorGroupId(contractorGroupId);
    setShowControls(true);
  }

  const selectors = (
    <Fetched fetched={[contractorGroups, jobTypes]}>
      <ControlGroupSelection
        jobTypes={displayJobTypes}
        contractorGroups={displayContractorGroups}
        {...{
          jobTypeId,
          setJobTypeId,
          contractorGroupId,
          setContractorGroupId,
        }}
      />
    </Fetched>
  );

  return (
    <>
      <ModalErrorBoundary>
        <ControlsModal
          show={showControls && !!controlMatrix && !!controlMatrix.response}
          setShow={setShowControls}
          selectors={selectors}
          controlsList={modalControlsList}
          removeControlOverride={removeControlOverride}
          updateControlValue={updateControlValue}
        />
      </ModalErrorBoundary>
      <Fetched fetched={[jobTypes, contractorGroups]}>
        <GroupFilters
          jobTypes={jobTypes.response && jobTypes.response.data.jobTypes}
          contractorGroups={contractorGroups.response && contractorGroups.response.data.contractorGroups}
          {...{
            selectedJobTypes,
            setSelectedJobTypes,
            selectedContractorGroups,
            setSelectedContractorGroups,
          }}
        />
      </Fetched>
      <div className="mt-4">
        <Fetched fetched={[jobTypes, contractorGroups, controlMatrix]}>
          <ManagementMatrix
            contractorGroups={markedContractorGroups}
            controlMatrix={controlMatrix.response && controlMatrix.response.data.marketManagementControlMatrix}
            jobTypes={markedJobTypes}
            openControls={openControls}
          />
        </Fetched>
      </div>
    </>
  );
}


export default MarketManagement;
