module.exports = {
  name: 'SubtractSavingsFromAvailable',
  type: 'checkbox',
  default: false,
  section: 'budget',
  title: 'Subtract Savings from Available',
  description:
    'Subtracts anything marked as savings from "Available" in the budget breakdown. Any categories under a category group that includes "Savings" in its name will be taken into account.' +
    ' You can also add "Savings" anywhere in the name of a category to mark it.',
};
