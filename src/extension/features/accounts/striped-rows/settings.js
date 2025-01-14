module.exports = [
  {
    name: 'AccountsStripedRows',
    type: 'checkbox',
    default: false,
    section: 'accounts',
    title: 'Striped Transaction Rows',
    description:
      'Alternate backgrounds on every other transaction row. Set your own background color or use the default below.',
    hidden: true,
  },
  {
    name: 'AccountsStripedRowsColor',
    type: 'color',
    default: '#fafafa',
    section: 'accounts',
    title: 'Striped Transaction Rows - Default/Classic Theme Color',
    description:
      'The color which will be used for the Default and Classic YNAB Themes. The default is #fafafa.',
    hidden: true,
  },
  {
    name: 'AccountsStripedRowsDarkColor',
    type: 'color',
    default: '#1e1e1f',
    section: 'accounts',
    title: 'Striped Transaction Rows - Dark Theme Color',
    description: 'The color which will be used for the Dark YNAB Theme. The default is #1e1e1f.',
    hidden: true,
  },
];
