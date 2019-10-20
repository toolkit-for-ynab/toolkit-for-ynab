module.exports = {
  name: 'Pacing',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Add Pacing to the Budget',
  description:
    "Add a column for 'pacing' which shows you how much money you've spent based on how far you are through the month. Note that clicking on the pacing value will toggle emphasis, allowing you to selectively enable the feature per category.",
  options: [
    { name: 'Disabled', value: '0' },
    { name: 'Show Full Amount', value: '1' },
    { name: 'Show Simple Indicator', value: '2' },
    { name: 'Show Days Ahead/Behind Schedule', value: '3' },
  ],
};
