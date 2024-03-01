module.exports = {
  name: 'DisplayTotalMonthlyGoals',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Add Total Monthly Targets',
  description:
    "Add a 'Total Monthly Targets' section to the budget inspector, which displays the total amount of monthly funding targets. It's also possible to have a more detailed overview of the targets, and information of 'Income vs Spending' for the month.",
  options: [
    { name: 'Show monthly target amount', value: 'show-total-only' },
    { name: 'Show monthly target amount with targets breakdown', value: 'show-goal-breakdown' },
    {
      name: 'Show monthly target amount, targets breakdown and income vs spending overview',
      value: 'show-goal-breakdown-and-income-vs-spending',
    },
  ],
};
