module.exports = {
  name: 'DisplayTargetGoalAmount',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Display Target and Emphasize Overbudget',
  description: `Adds a "Target" column which displays the target amount for every category with a target. Optionally emphasize the amount as red if you've budgeted beyond your target or green if you've met/exceeded your target.`,
  options: [
    { name: 'Display target amount with no emphasis', value: '3' },
    { name: 'Display target amount and emphasize overbudget with red', value: '1' },
    { name: 'Display target amount and emphasize funded targets as green', value: '2' },
  ],
};
