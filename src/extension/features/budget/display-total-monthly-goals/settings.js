module.exports = {
  name: 'DisplayTotalMonthlyGoals',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Add Total Monthly Goals',
  description:
    "Add a 'Total Monthly Goals' section to the budget inspector, which displays the total amount of monthly funding goals. It's also possible to have a more detailed overview of the goals, and information of 'Income vs Spending' for the month.",
  options: [
    { name: 'Show monthly goal amount', value: 'show-total-only' },
    { name: 'Show monthly goal amount with goals breakdown', value: 'show-goal-breakdown' },
    {
      name: 'Show monthly goal amount, goals breakdown and income vs spending overview',
      value: 'show-goal-breakdown-and-income-vs-spending',
    },
  ],
};
