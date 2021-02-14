import React from "react";

import {css, StyleSheet} from "aphrodite";
import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";

import { submarketRuleShape } from "./shapes";

function AllocationRule(props) {
  const pct = Math.round(props.rule.totalAllocation * 100);

  function fallbackLabel() {
    return props.rule.entityType === "Contractor" ? "Everyone else" : "Everything else";
  }

  return (
    <>
      {!props.rule.fallback && (
        <>
          <div className={props.rule.markedForDeletion && css(styles.deleted)}>
            {props.rule.name}
          </div>
          <div className={props.rule.markedForDeletion && css(styles.deleted)}>
            {props.rule.filter}
          </div>
        </>
      )}
      {props.rule.fallback && (
        <div>{fallbackLabel()}</div>
      )}
      <div className={(props.rule.valid ? "" : "text-danger")}>
        {pct}%
      </div>
      {!props.rule.fallback && !props.rule.markedForDeletion && (
        <div>
          <Button variant="outline-secondary" size="sm" onClick={props.onDelete}>
            <i className="fa fa-trash" />
          </Button>
        </div>
      )}
      {props.rule.markedForDeletion && (
        <div>
          <Button variant="outline-secondary" size="sm" onClick={props.onUndelete}>
            <i className="fa fa-undo" />
          </Button>
        </div>
      )}
    </>
  );
}

AllocationRule.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onUndelete: PropTypes.func.isRequired,
  rule: submarketRuleShape.isRequired,
};

const styles = StyleSheet.create({
  deleted: {
    textDecoration: "line-through",
  }
});

export default AllocationRule;
