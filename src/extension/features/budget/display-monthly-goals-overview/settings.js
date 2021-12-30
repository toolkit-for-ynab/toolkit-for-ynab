module.exports = {
  name: 'DisplayMonthlyGoalsOverview',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Add Monthly Goals Overview',
  description:
    "Add a 'Monthly Goals Overview' section to the budget inspector, which displays info about monthly funding goals.",
  options: [
    { name: 'Show monthly goal amount', value: 'show-total-only' },
    { name: 'Show monthly goal amount with goals breakdown', value: 'show-goal-breakdown' },
    {
      name: 'Show monthly goal amount, goals breakdown and income vs spending overview',
      value: 'show-goal-breakdown-and-income-vs-spending',
    },
  ],
};
