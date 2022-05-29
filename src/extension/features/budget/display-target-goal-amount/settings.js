module.exports = {
  disabled: true,
  name: 'DisplayTargetGoalAmount',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Display Target Goal and Emphasize Overbudget',
  description: `Adds a "Goal" column which displays the target goal amount for every category with a goal. Optionally emphasize the amount as red if you've budgeted beyond your goal or green if you've met/exceeded your goal.`,
  options: [
    { name: 'Display goal amount with no emphasis', value: '3' },
    { name: 'Display goal amount and emphasize overbudget with red', value: '1' },
    { name: 'Display goal amount and emphasize funded goals as green', value: '2' },
  ],
};
