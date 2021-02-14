import React from "react";

import { jobStatsShape } from "../shapes";

function hms(ms) {
  if (ms === undefined || ms === null) { return "--:--:--"; }

  return new Date(ms).toISOString().substr(11, 8);
}

function MarketSummary(props) {
  const jobs = props.jobs && props.jobs.data && props.jobs.data.jobs || {};
  const durationString = hms(jobs.totalDuration);
  const totalJobs = jobs && jobs.items && jobs.items.length;
  return (
    <div>
      {totalJobs || "--"} jobs ({durationString})
    </div>
  );
}

MarketSummary.propTypes = {
  jobs: jobStatsShape,
};

export default MarketSummary;
