module.exports = {
  name: 'RemoveZeroCategories',
  type: 'checkbox',
  default: false,
  section: 'budget',
  title: 'Hide Negative/Zero Categories When Covering Overspending',
  description: `Removes categories which have a zero or negative balance from the "Cover Overspending" menu since they don't have any way of helping.`,
};
