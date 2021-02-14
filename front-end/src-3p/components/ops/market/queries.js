export const contractorStatsQuery = `query ContractorStatsQuery($query: String) {
  contractors(query: $query) {
    items {
      id
      name
      availableJobAccessCount
    }
  }
}`;

export const jobStatsQuery = `query JobStats($query: String) {
  jobs(query: $query) {
    items {
      id
      name
      duration
      deadline
      accessCount
      loggedInAccessCount
      priorityStars
      timeOnMarket
    }
    totalDuration
  }
}`;

export const submarketRuleQuery = `query submarketRules{
  submarkets {
    id
    name
    contractorCount
    throttledJobCount
    availableJobCount
  }
  submarketRules {
    id
    entityType
    filter
    fallback
    name
    description
    submarketAllocations {
      submarketId
      allocation
    }
  }
}`;

export const ummV1ControlsQuery = `query UmmV1ControlsQuery($contractorGroupId: Int, $jobTypeId: Int) {
  ummV1Controls (contractorGroupId: $contractorGroupId, jobTypeId: $jobTypeId) {
    items { id contractorGroupId jobTypeId controlType controlValue }
  }
}`;

export const marketManagementControlMatrixQuery = `query MarketManagementControlMatrixQuery {
  marketManagementControlMatrix(controlTypes: ["total_hour_target", "project_cap", "deadline_distribution"]) {
    id controlType controlValue jobTypeId contractorGroupId inherited
  }
}`;
