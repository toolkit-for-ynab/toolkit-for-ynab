module.exports = {
  name: 'RowHeight',
  type: 'select',
  default: false,
  section: 'accounts',
  title: 'Height of Rows in Account Register',
  description: 'Change the height of transaction rows so more of them are displayed on the screen.',
  options: [
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
  ],
};
