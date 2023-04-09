module.exports = {
  name: 'LiveOnLastMonthsIncome',
  type: 'select',
  default: false,
  section: 'budget',
  title: "Live on Last Month's Income",
  description:
    "Add a section to the budget inspector showing your variance between last month's income and this month's assigned budget for users who still live by the old Rule #4.",
  options: [
    { name: 'Use previous month', value: '1' },
    { name: 'Use month before last', value: '2' },
    { name: 'Use two months before last', value: '3' },
    { name: 'Use three months before last', value: '4' },
  ],
};
