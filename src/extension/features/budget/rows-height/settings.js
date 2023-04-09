module.exports = {
  name: 'RowsHeight',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Adjust Budget Row Height',
  description:
    'Make the height of budget category rows smaller allowing more categories to fit on the screen.',
  options: [
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
    { name: 'Slim with smaller font', value: '3' },
    { name: 'Medium', value: '4' },
    { name: 'Large', value: '5' },
  ],
};
