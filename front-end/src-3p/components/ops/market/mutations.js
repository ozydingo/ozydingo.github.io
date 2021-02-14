export const marketManagementControlMutation = `mutation MarketManagementControl(
  $controlType: String!, $controlValue: String!, $contractorGroupId: Int, $jobTypeId: Int
) {
  marketManagementControl(
    controlType: $controlType, controlValue: $controlValue, contractorGroupId: $contractorGroupId, jobTypeId: $jobTypeId
  ) {
    success
    errors
    currentControl { id contractorGroupId jobTypeId controlType controlValue }
  }
}`;

export const resaltSubmarketsMutation = `mutation ResaltSubmarketsMutation {
  resaltSubmarkets {
    success
    error
  }
}`;

export const deleteMarketManagementControlMutation = `mutation DeleteMarketManagementControl($id: Int!) {
  deleteMarketManagementControl (id: $id) {
    success
    errors
    currentControl { id contractorGroupId jobTypeId controlType controlValue }
  }
}`;

export const submarketRulesMutation = `mutation SubmarketRules($rules: [SubmarketRuleInput!]!) {
  submarketRules (rules: $rules) {
    success
    error
  }
}`;
