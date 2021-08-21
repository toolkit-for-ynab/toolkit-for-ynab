module.exports = {
  name: 'RowHeight',
  type: 'select',
  default: false,
  section: 'accounts',
  title: 'Adjust Transaction Row Height',
  description:
    'Make the height of transaction rows smaller allowing more transactions to fit on the screen.',
  options: [
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
  ],
};
