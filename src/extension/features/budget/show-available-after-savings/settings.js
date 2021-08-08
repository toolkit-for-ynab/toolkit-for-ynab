module.exports = {
  name: 'ShowAvailableAfterSavings',
  type: 'checkbox',
  default: false,
  section: 'budget',
  title: 'Show Available After Savings',
  description:
    'Shows "Available After Savings" in the budget breakdown. This allows you to see how much you have available if you exclude your savings.' +
    ' Any categories under a category group that includes "Savings" in its name will be taken into account.' +
    ' You can also add "Savings" anywhere in the name of a category to mark it.',
};
