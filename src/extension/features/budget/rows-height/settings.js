module.exports = {
  name: 'RowsHeight',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Height of Budget Rows',
  description:
    'Makes the budget rows skinnier than the default YNAB style so that you can fit more on the screen.',
  options: [
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
    { name: 'Slim with smaller font', value: '3' },
  ],
};
