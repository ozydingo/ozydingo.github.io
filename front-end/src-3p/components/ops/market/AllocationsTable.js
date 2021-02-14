import React, { useMemo } from "react";

import PropTypes from "prop-types";
import { StyleSheet, css } from "aphrodite";

import Button from "react-bootstrap/Button";

import SubmarketRuleModel from "lib/ops/SubmarketRuleModel";

import AllocationSlider from "./AllocationSlider";
import AllocationRule from "./AllocationRule";

import {
  contractorsPath,
  jobsPath,
} from "./paths";

// Use CSS grid, but with a dynamic but specified number of rows & cols
// Honestly, <table> is probably a better tool.
function computeGridLayout(numSubmarkets) {
  const styles = {
    grid: {
      display: "grid",
      gridTemplateColumns: `250px repeat(${numSubmarkets}, 1fr) 70px`,
    },
    addNewRow: {
      gridColumnStart: "1",
      gridColumnEnd: String(numSubmarkets + 3),
    }
  };
  return StyleSheet.create(styles);
}

function ruleClass(rule) {
  if (rule.newRecord) {
    return "newRule";
  } else if (rule.markedForDeletion) {
    return "deletedRule";
  } else if (rule.dirty) {
    return "modifiedRule";
  } else {
    return "";
  }
}

function sortRules(rules) {
  const filterRules = rules.filter(x => !x.fallback);
  const fallbackRules = rules.filter(x => x.fallback);
  return filterRules.concat(fallbackRules);
}

function AllocationsTable(props) {
  const stylez = useMemo(
    () => computeGridLayout(props.submarkets.length),
    [props.submarkets]
  );

  const sortedJobRules = useMemo(() => sortRules(props.jobRules), [props.jobRules]);
  const sortedContractorRules = useMemo(() => sortRules(props.contractorRules), [props.contractorRules]);

  // Create an update function for each slider.
  const jobAllocationHandlers = useMemo(() => {
    return sortedJobRules.map((rule, ii) => {
      return rule.allocations.map((allocation, jj) => {
        return (event) => updateJobAllocation(ii, jj, Number(event.target.value));
      });
    });
  }, [sortedJobRules]);

  // Create an delete function for each ruile.
  const jobRuleDeleteHandlers = useMemo(() => {
    return sortedJobRules.map((rule, ii) => {
      return () => removeJobRule(ii);
    });
  }, [sortedJobRules]);

  // Create an delete function for each ruile.
  const jobRuleUndeleteHandlers = useMemo(() => {
    return sortedJobRules.map((rule, ii) => {
      return () => restoreJobRule(ii);
    });
  }, [sortedJobRules]);

  // Create an update function for each slider.
  const contractorAllocationHandlers = useMemo(() => {
    return sortedContractorRules.map((rule, ii) => {
      return rule.allocations.map((allocation, jj) => {
        return (event) => updateContractorAllocation(ii, jj, Number(event.target.value));
      });
    });
  }, [sortedContractorRules]);

  // Create an delete function for each ruile.
  const contractorRuleDeleteHandlers = useMemo(() => {
    return sortedContractorRules.map((rule, ii) => {
      return () => removeContractorRule(ii);
    });
  }, [sortedContractorRules]);

  const contractorRuleUndeleteHandlers = useMemo(() => {
    return sortedContractorRules.map((rule, ii) => {
      return () => restoreContractorRule(ii);
    });
  }, [sortedContractorRules]);

  function updateJobAllocation(ruleIndex, allocationIndex, value) {
    const newRules = updateAllocations(sortedJobRules, ruleIndex, allocationIndex, value);
    props.setJobRules(newRules);
  }

  function updateContractorAllocation(ruleIndex, allocationIndex, value) {
    const newRules = updateAllocations(sortedContractorRules, ruleIndex, allocationIndex, value);
    props.setContractorRules(newRules);
  }

  function updateAllocations(rules, ruleIndex, allocationIndex, value) {
    const newRule = rules[ruleIndex].setAllocation(allocationIndex, value);
    const newRules = rules.slice();
    newRules[ruleIndex] = newRule;
    return newRules;
  }

  function showNewJobRuleDialog() {
    props.setNewRuleDialogType("Job");
  }

  function removeJobRule(ii) {
    const newRules = deleteRule(sortedJobRules, ii);
    props.setJobRules(newRules);
  }

  function restoreJobRule(ii) {
    const newRules = restoreRule(sortedJobRules, ii);
    props.setJobRules(newRules);
  }

  function showNewContractorRuleDialog() {
    props.setNewRuleDialogType("Contractor");
  }

  function removeContractorRule(ii) {
    const newRules = deleteRule(sortedContractorRules, ii);
    props.setContractorRules(newRules);
  }

  function restoreContractorRule(ii) {
    const newRules = restoreRule(sortedContractorRules, ii);
    props.setContractorRules(newRules);
  }

  function deleteRule(rules, ii) {
    if (rules[ii].newRecord) {
      return [
        ...rules.slice(0,ii),
        ...rules.slice(ii + 1, rules.length)
      ];
    } else {
      const newRule = rules[ii].markForDeletion();
      return [
        ...rules.slice(0,ii),
        newRule,
        ...rules.slice(ii + 1, rules.length)
      ];
    }
  }

  function restoreRule(rules, ii) {
    const newRule = rules[ii].unmarkForDeletion();
    return [
      ...rules.slice(0,ii),
      newRule,
      ...rules.slice(ii + 1, rules.length)
    ];
  }

  return (
    <div className={css(stylez.grid)}>
      <div className={css(styles.gridCell)}>
      </div>
      {props.submarkets.map(submarket => (
        <div key={submarket.id} className={css(styles.gridCell)}>
          {submarket.name}
        </div>
      ))}
      <div className={styles.gridCell}>
        <Button variant="link" className="p-0 border-0 align-top text-dark" disabled>+ New</Button>
      </div>
      <div className={css(styles.gridCell, styles.jobsHeader)}>Jobs</div>
      {props.submarkets.map((submarket, ii) => (
        <div key={ii} className={css(styles.gridCell, styles.jobsHeader)}>
          {!props.disabled && (
            <>
              <a
                className="text-dark"
                href={jobsPath({submarkets_id_eq: submarket.id, state_eq: "holding"})}
                target="_blank" rel="noopener noreferrer"
              >
                {submarket.availableJobCount + submarket.throttledJobCount} jobs
              </a> (
              <a
                className="text-dark"
                href={jobsPath({submarkets_id_eq: submarket.id, state_eq: "available"})}
                target="_blank" rel="noopener noreferrer"
              >
                {submarket.availableJobCount} avail.
              </a>)
            </>
          )}
        </div>
      ))}
      <div></div>
      {sortedJobRules.map((rule, ii) => (
        <React.Fragment key={ii}>
          <div className={css(styles.gridCell, styles[ruleClass(rule)])}>
            <AllocationRule
              rule={rule}
              onDelete={jobRuleDeleteHandlers[ii]}
              onUndelete={jobRuleUndeleteHandlers[ii]}
            />
          </div>
          {rule.allocations.map((allocation, jj) => (
            <div key={jj} className={css(styles.gridCell)}>
              <AllocationSlider
                allocation={allocation.allocation}
                disabled={props.disabled || rule.markedForDeletion}
                onChange={jobAllocationHandlers[ii][jj]}
              />
            </div>
          ))}
          <div></div>
        </React.Fragment>
      ))}
      <div></div>
      <div className={css(styles.gridCell, stylez.addNewRow)}>
        <Button
          variant="link"
          className="p-0 border-0 align-top text-dark"
          onClick={showNewJobRuleDialog}
        >
          + New Rule
        </Button>
      </div>
      <div className={css(styles.gridCell, styles.contractorsHeader)}>Contractors</div>
      {props.submarkets.map((submarket, ii) => (
        <div key={ii} className={css(styles.gridCell, styles.contractorsHeader)}>
          {!props.disabled && (
            <a
              className="text-dark"
              href={contractorsPath({submarkets_id_eq: submarket.id, deleted_false: true})}
              target="_blank" rel="noopener noreferrer"
            >
              {submarket.contractorCount} contractors
            </a>
          )}
        </div>
      ))}
      <div></div>
      {sortedContractorRules.map((rule, ii) => (
        <React.Fragment key={ii}>
          <div className={css(styles.gridCell, styles[ruleClass(rule)])}>
            <AllocationRule
              rule={rule}
              onDelete={contractorRuleDeleteHandlers[ii]}
              onUndelete={contractorRuleUndeleteHandlers[ii]}
            />
          </div>
          {rule.allocations.map((allocation, jj) => (
            <div key={jj} className={css(styles.gridCell)}>
              <AllocationSlider
                allocation={allocation.allocation}
                disabled={props.disabled || rule.markedForDeletion}
                onChange={contractorAllocationHandlers[ii][jj]}
              />
            </div>
          ))}
          <div></div>
        </React.Fragment>
      ))}
      <div></div>
      <div className={css(styles.gridCell, stylez.addNewRow)}>
        <Button
          variant="link"
          className="p-0 border-0 align-top text-dark"
          onClick={showNewContractorRuleDialog}
        >
          + New Rule
        </Button>
      </div>
    </div>
  );
}

AllocationsTable.propTypes = {
  contractorRules: PropTypes.arrayOf(PropTypes.instanceOf(SubmarketRuleModel)),
  disabled: PropTypes.bool,
  jobRules: PropTypes.arrayOf(PropTypes.instanceOf(SubmarketRuleModel)),
  setContractorRules: PropTypes.func.isRequired,
  setJobRules: PropTypes.func.isRequired,
  setNewRuleDialogType: PropTypes.func.isRequired,
  submarkets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  })),
};

const styles = StyleSheet.create({
  contractorsHeader: {
    backgroundColor: "#aaddee88",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  deletedRule: {
    borderLeft: "4px solid #cc4444",
    paddingLeft: "2px",
  },
  gridCell: {
    padding: "4px 0.5rem",
  },
  jobsHeader: {
    backgroundColor: "#fff04888",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  modifiedRule: {
    borderLeft: "6px solid #ccbb88",
    paddingLeft: "2px",
  },
  newRule: {
    borderLeft: "6px solid #88bbee",
    paddingLeft: "2px",
  },
});

export default AllocationsTable;
