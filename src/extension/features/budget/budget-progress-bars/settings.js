module.exports = {
  name: 'BudgetProgressBars',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Budget Rows Progress Bars',
  description:
    'Add progress bars and a vertical bar that shows how far you are through the month to category rows.',
  options: [
    { name: 'Target progress', value: 'goals' },
    { name: 'Pacing progress', value: 'pacing' },
    {
      name: 'Pacing on name column and targets on budgeted column',
      value: 'both',
    },
  ],
};
