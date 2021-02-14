import PropTypes from "prop-types";

export const jobShape = PropTypes.shape({
  accessCount: PropTypes.number,
  deadline: PropTypes.instanceOf(Date),
  loggedInAccessCount: PropTypes.number,
});

export const jobStatsShape = PropTypes.shape({
  data: PropTypes.shape({
    jobs: PropTypes.shape({
      items: PropTypes.arrayOf(jobShape),
      totalDuration: PropTypes.number,
    })
  })
});

export const marketManagementControlShape = PropTypes.shape({
  id: PropTypes.number,
  contractorGroupId: PropTypes.number,
  jobTypeId: PropTypes.number,
  controlType: PropTypes.string,
  controlValue: PropTypes.string,
  inherited: PropTypes.bool,
});

export const resqueJobShape = PropTypes.shape({
  processing: PropTypes.bool.isRequired,
  index: PropTypes.number,
});

export const submarketDetailsShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
});

export const submarketSummaryShape = PropTypes.shape({
  submarket_id: PropTypes.number.isRequired,
  submarket_name: PropTypes.string.isRequired,
  contractor_count: PropTypes.number.isRequired,
  throttled_job_count: PropTypes.number.isRequired,
  available_job_count: PropTypes.number.isRequired,
});

export const submarketAllocationShape = PropTypes.shape({
  submarketId: PropTypes.number,
  allocation: PropTypes.number,
});

export const submarketRuleShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  filter: PropTypes.string,
  entityType: PropTypes.string.isRequired,
  submarketAllocations: PropTypes.arrayOf(submarketAllocationShape),
});

export const ummV1DeadlineDistribution = PropTypes.shape({
  name: PropTypes.string,
  target: PropTypes.number,
  startHours: PropTypes.number,
  endHours: PropTypes.number,
});

export const ummV1ControlsShape = PropTypes.shape({
  data: PropTypes.shape({
    ummV1Controls: PropTypes.shape({
      totalHourTarget: PropTypes.number,
      projectCap: PropTypes.number,
      deadlineDistribution: PropTypes.arrayOf(ummV1DeadlineDistribution),
    }),
  }),
});
