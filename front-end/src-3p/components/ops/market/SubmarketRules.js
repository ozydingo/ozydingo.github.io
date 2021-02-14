// Submarket and Submarket Rules dashboard for Ops, allowing editing of allocation rules.
// This component largely handles state, top-level structure, and modals.
// The controls themselves are in the <AllocationsTable> component.

import React, { useEffect, useState } from "react";

import PropTypes from "prop-types";

import Button from 'react-bootstrap/Button';

import ErrorModal from "components/ops/common/ErrorModal";
import Modals from "components/ops/common/Modals";

import AllocationsTable from "./AllocationsTable";
import NewRuleDialog from "./NewRuleDialog";
import ReshuffleMarketDialog from "./ReshuffleMarketDialog";

import SubmarketRuleModel from "lib/ops/SubmarketRuleModel";
import { threeplayApi } from "components/ops/common/threeplayApi";
import { submarketRulesMutation } from "./mutations";
import { submarketRuleQuery } from "./queries";

function SubmarketRules(props) {
  const [contractorRules, setContractorRules] = useState([]);
  const [error, setError] = useState(false);
  const [errorModalText, setErrorModalText] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [jobRules, setJobRules] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [newRuleDialogType, setNewRuleDialogType] = useState(null);
  const [showReshuffleMarketModal, setShowReshuffleMarketModal] = useState(false);
  const [submarkets, setSubmarkets] = useState([]);
  const [working, setWorking] = useState(false);

  const allRulesValid = jobRules.concat(contractorRules).every(rule => rule.valid);

  useEffect(() => {
    setFetching(true);
    loadRules().then(() => {setFetching(false);});
  }, []);

  function refresh() {
    setWorking(true);
    loadRules().then(() => {setWorking(false);});
  }

  function showShuffle() {
    setShowReshuffleMarketModal(true);
  }

  function hideShuffle() {
    setShowReshuffleMarketModal(false);
  }

  function hideErrorModal() {
    setShowErrorModal(false);
  }

  function hideNewRuleDialog() {
    setNewRuleDialogType(null);
  }

  // Yes it's N^2. But N is like 4, so bite me.
  function orderedAllocations(allocations, submarkets) {
    return submarkets.map(submarket => {
      const allocation = allocations.find(alloc => alloc.submarketId === submarket.id);
      return allocation || {submarketId: submarket.id, allocation: 0};
    });
  }

  async function loadRules() {
    const response = await threeplayApi.json(submarketRuleQuery);
    if (!response.data) {
      setError("Something went wrong");
      setFetching(false);
      return;
    }

    setSubmarkets(response.data.submarkets);

    const theJobRules = response.data.submarketRules.filter(rule => rule.entityType === "Job");
    setJobRules(theJobRules.map(rule => {
      return new SubmarketRuleModel(rule, orderedAllocations(rule.submarketAllocations, response.data.submarkets));
    }));

    const theContractorRules = response.data.submarketRules.filter(rule => rule.entityType === "Contractor");
    setContractorRules(theContractorRules.map(rule => {
      return new SubmarketRuleModel(rule, orderedAllocations(rule.submarketAllocations, response.data.submarkets));
    }));
  }

  async function saveRules() {
    setWorking(true);

    const rules = jobRules.concat(contractorRules).filter(rule => {
      return rule.dirty;
    }).map(rule => rule.toGraphQLInput());
    const variables = {rules};
    const response = await threeplayApi.json(submarketRulesMutation, variables);

    if (response.errors) {
      console.error(response); // eslint-disable-line no-console
      setError(true);
    } else if (!response.data.submarketRules.success) {
      console.error(response); // eslint-disable-line no-console
      setErrorModalText("That didn't work: " + response.data.submarketRules.error);
      setShowErrorModal(true);
    } else {
      loadRules();
    }

    setWorking(false);
  }

  function addRule(ruleAttributes) {
    const newRule = new SubmarketRuleModel(
      ruleAttributes,
      submarkets.map(submarket => ({submarketId: submarket.id, allocation: 0}))
    );
    newRule.dirty = true;
    if (newRule.entityType === "Job") {
      const newJobRules = jobRules.concat(newRule);
      setJobRules(newJobRules);
    } else if (newRule.entityType === "Contractor") {
      const newContractorRules = contractorRules.concat(newRule);
      setContractorRules(newContractorRules);
    }
    setNewRuleDialogType(undefined);
  }

  if (error) {
    return (
      <div>
        Something went wrong :(
      </div>
    );
  }

  if (fetching) {
    return (
      <div>
        Fetching data, please wait...
      </div>
    );
  }

  return (
    <>
      <Modals>
        <ErrorModal show={showErrorModal} onAcknowledge={hideErrorModal}>
          {errorModalText}
        </ErrorModal>
        <ReshuffleMarketDialog
          csrfToken={props.csrfToken}
          onCancel={hideShuffle}
          onSubmit={refresh}
          show={showReshuffleMarketModal}
        />
        <NewRuleDialog
          show={!!newRuleDialogType}
          entityType={newRuleDialogType}
          onCancel={hideNewRuleDialog}
          onSubmit={addRule}
        />
      </Modals>
      <AllocationsTable
        contractorRules={contractorRules}
        disabled={working}
        jobRules={jobRules}
        setJobRules={setJobRules}
        setContractorRules={setContractorRules}
        setNewRuleDialogType={setNewRuleDialogType}
        submarkets={submarkets}
      />
      <div className="d-flex justify-content-between">
        <div>
          <Button variant="outline" className="m-2" onClick={refresh}>
            <i className="fa fa-refresh" />
          </Button>
          <Button disabled={working} variant="outline-danger" className="m-2"  onClick={showShuffle}>
            Reshuffle Markets
          </Button>
        </div>
        <Button disabled={working || !allRulesValid} variant="primary" className="m-2" onClick={saveRules}>
          Save Rules
        </Button>
      </div>
    </>
  );
}

SubmarketRules.propTypes = {
  csrfToken: PropTypes.string,
};

export default SubmarketRules;
