module.exports = {
  name: 'Pacing',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Add Pacing',
  description: `Add a column for "pacing" which shows you how much money you have left in your budget proportionate to how much time is left in the month.`,
  options: [
    { name: 'Show Full Amount', value: '1' },
    { name: 'Show Simple Indicator', value: '2' },
    { name: 'Show Days Ahead/Behind Schedule', value: '3' },
  ],
};
