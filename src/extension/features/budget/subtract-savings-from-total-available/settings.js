module.exports = {
  name: 'SubtractSavingsFromTotalAvailable',
  type: 'checkbox',
  default: false,
  section: 'budget',
  title: 'Subtract Savings from Total Available',
  description:
    'Adds "Available After Savings" to the budget breakdown. This allows you to see how much you have available if you exclude your savings.' +
    ' Any categories under a category group that includes "Savings" in its name will be taken into account.' +
    ' You can also add "Savings" anywhere in the name of a category to mark it.',
};
