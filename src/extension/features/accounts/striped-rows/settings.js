module.exports = [
  {
    name: 'AccountsStripedRows',
    type: 'checkbox',
    default: false,
    section: 'accounts',
    title: 'Striped Transaction Rows',
    description: 'Shows a light gray background on every other transaction row.',
  },
  {
    name: 'AccountsStripedRowsColor',
    type: 'color',
    default: '#fafafa',
    section: 'accounts',
    title: 'Default Theme Color for Striped Transaction Rows',
    description: 'Blah blah blah',
  },
  {
    name: 'AccountsStripedRowsDarkColor',
    type: 'color',
    default: '#1e1e1f',
    section: 'accounts',
    title: 'Dark Theme Color for Striped Transaction Rows',
    description: 'Blah blah blah',
  },
];
