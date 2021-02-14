import React from "react";

import PropTypes from "prop-types";
import { StyleSheet, css } from "aphrodite";

import Table from "react-bootstrap/Table";

import { jobPath } from "../paths";
import { jobShape } from "../shapes";

function JobsTable(props) {
  return (
    <Table size="sm" striped bordered className={css(styles.table)}>
      <thead>
        <tr>
          <th className={css(styles.th)}>ID</th>
          <th className={css(styles.th, styles.nameCell)}>Name</th>
          <th className={css(styles.th)}># Accesses</th>
          <th className={css(styles.th)}>Deadline</th>
          <th className={css(styles.th)}>Hours on Market</th>
        </tr>
      </thead>
      <tbody>
        {props.jobs.map(job => (
          <tr key={job.id}>
            <td className={css(styles.idCell)}>
              {job.id}{" "}
              <a href={jobPath(job.id)} target="_blank" rel="noopener noreferrer">
                <i className="fa fa-external-link" />
              </a>
            </td>
            <td className={css(styles.nameCell)}>{job.name}</td>
            <td>{job.loggedInAccessCount} / {job.accessCount}</td>
            <td>{new Date(job.deadline).toLocaleString()}</td>
            <td>{job.hoursOnMarket.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

JobsTable.propTypes = {
  jobs: PropTypes.arrayOf(jobShape),
};

const styles = StyleSheet.create({
  idCell: {
    whiteSpace: "nowrap",
  },
  nameCell: {
    maxWidth: "30em",
    wordBreak: "break-all",
  },
  table: {
    width: "100%",
  },
  th: {
    position: "sticky",
    top: "0",
    backgroundColor: "white",
  },
});

export default JobsTable;
