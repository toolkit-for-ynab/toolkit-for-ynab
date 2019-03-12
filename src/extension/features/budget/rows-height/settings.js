module.exports = {
  name: 'RowsHeight',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Height of Budget Rows',
  description:
    'Makes the budget rows skinnier than the default YNAB style so that you can fit more on the screen.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
    { name: 'Slim with smaller font', value: '3' },
  ],
};
