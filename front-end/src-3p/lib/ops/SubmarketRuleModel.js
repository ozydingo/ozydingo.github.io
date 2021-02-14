// Data model for submarket rules and allocations
// Consolidates logic for determining allocation validity, managing updates,
// and (TODO) storing original values for reverting

class SubmarketRuleModel {
  constructor(
    { id, name, description, entityType, filter },
    allocations
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.entityType = entityType;
    this.filter = filter;
    this.allocations = allocations.map(this.parseAllocation);

    this.dirty = false;
    this.fallback = this.filter === null;
    this.newRecord = this.id === undefined;
    this.totalAllocation = this.computeTotalAllocation();
    this.valid = this.isValid();
  }

  copy({ allocations } = {}) {
    const clone = new SubmarketRuleModel({
      id: this.id,
      name: this.name,
      description: this.description,
      entityType: this.entityType,
      filter: this.filter,
    }, allocations || this.allocations);
    clone.dirty = this.dirty;
    return clone;
  }

  toGraphQLInput() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      entityType: this.entityType,
      filter: this.filter,
      markedForDeletion: this.markedForDeletion,
      submarketAllocations: this.allocations,
    };
  }

  parseAllocation({submarketId, allocation}) {
    return {submarketId, allocation};
  }

  // React-optimized to return a new object with the updated allocation
  setAllocation(ii, allocation) {
    const newAllocations = this.allocations.slice();
    newAllocations[ii] = {submarketId: newAllocations[ii].submarketId, allocation};
    const newRule = this.copy({allocations: newAllocations});
    newRule.dirty = true;
    return newRule;
  }

  // React-optimized to return a new object with the updated state
  markForDeletion() {
    const newRule = this.copy();
    newRule.markedForDeletion = true;
    newRule.dirty = true;
    newRule.valid = true;
    return newRule;
  }

  unmarkForDeletion() {
    return this.copy();
  }

  // Total allocation is the total random space covered by the allocations.
  computeTotalAllocation() {
    const splitAllocations = this.allocations.filter(alloc => {
      return alloc.allocation !== 1;
    });
    const summedSplitAllocation = splitAllocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
    if (summedSplitAllocation !== 0) {
      // If any split (not 100%) allocationx exist, we consider the total allocation
      // to simply be their sum. Other 100% allocations are "transaprent".
      return summedSplitAllocation;
    } else {
      // It no split allocations exist, total allocation is 100% if we have any
      // full allocations, otherwise it is 0%.
      const hasFullAllocations = this.allocations.some(alloc => alloc.allocation === 1);
      return hasFullAllocations ? 1 : 0;
    }
  }

  isValid() {
    const total = Math.round(100 * this.computeTotalAllocation());
    return total === 100 || total === 0;
  }
}

export default SubmarketRuleModel;
