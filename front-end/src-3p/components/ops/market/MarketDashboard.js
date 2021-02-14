import React, { useState } from "react";

import { StyleSheet, css } from "aphrodite";

import Fetched from "components/ops/common/Fetched";

import JobAccessByUser from "./dashboard/JobAccessByUser";
import JobGraph from "./dashboard/JobGraph";
import JobsTable from "./dashboard/JobsTable";
import MarketSummary from "./dashboard/MarketSummary";

import { threeplayApi } from "components/ops/common/threeplayApi";
import useFetcher from "lib/global/useFetcher";

import { contractorStatsQuery, jobStatsQuery } from "./queries";

function fetchContractorStats() {
  const query = {contractor_accesses_id_null: false};
  return threeplayApi.json(contractorStatsQuery, {query: JSON.stringify(query)}).then(handleContractorResponse);
}

function fetchJobStats() {
  const query = {state_eq: "available", job_type_id_eq: 1};
  return threeplayApi.json(jobStatsQuery, {query: JSON.stringify(query)}).then(handleJobResponse);
}

function handleContractorResponse(response) {
  if (!response || !response.data ) { return response; }

  response.data.contractors.items.sort((a, b) => (a.availableJobAccessCount - b.availableJobAccessCount));
  return response;
}

function handleJobResponse(response) {
  if (!response || !response.data ) { return response; }

  const now = new Date();
  // in place editing is ok here; this is not a state variable yet
  response.data.jobs.items.forEach(job => {
    job.deadline = new Date(job.deadline * 1000);
    job.hoursToDeadline = (job.deadline - now) / (60 * 60 * 1000);
    job.hoursOnMarket = job.timeOnMarket / (60 * 60);
  });

  return response;
}

function MarketDashboard() {
  const [jobsForTable, setJobsForTable] = useState([]);

  const contractorStats = useFetcher(fetchContractorStats);
  const jobStats = useFetcher(fetchJobStats);
  const contractors = contractorStats.response && contractorStats.response.data && contractorStats.response.data.contractors.items || [];
  const jobs = jobStats.response && jobStats.response.data && jobStats.response.data.jobs.items || [];

  return (
    <>
      <h3>Available Jobs</h3>
      <MarketSummary jobs={jobStats.response} />
      <Fetched fetched={jobStats}>
        <div className="d-flex flex-row align-items-start">
          <div>
            <JobGraph jobs={jobs} onSelectJobs={setJobsForTable} />
          </div>
          <div className={css(styles.jobsTable)}>
            {jobsForTable.length > 0 && (
              <JobsTable jobs={jobsForTable} />
            )}
          </div>
        </div>
      </Fetched>
      <h3>Access by contractor</h3>
      <Fetched fetched={contractorStats}>
        <JobAccessByUser contractors={contractors} />
      </Fetched>
    </>
  );
}

const styles = StyleSheet.create({
  jobsTable: {
    height: "calc(300px - 4rem)",
    marginBottom: "2rem",
    overflowY: "scroll",
  }
});

export default MarketDashboard;
