export const calculateTarget = (clearedAmount, currentAmount) => {
  return currentAmount - clearedAmount;
};
// Validate that its a valid amount
// If any errors, set error on input
// Do the calculation:
// - Inputs: CurrentAmount, AccountId
// __toolkitUtils.getEntityManager().getAccountById('7bbf8e31-6746-46b6-81de-144735bf4c5c').getAccountCalculation()
//   - clearedBalance
//   - unclearedBalance
