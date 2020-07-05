module.exports = [
  {
    name: 'AccountsStripedRows',
    type: 'checkbox',
    default: false,
    section: 'accounts',
    title: 'Striped Transaction Rows',
    description:
      'Shows a different-color background on every other transaction row. See the Color for Striped Transaction Rows settings to specify the color to be used.',
  },
  {
    name: 'AccountsStripedRowsColor',
    type: 'color',
    default: '#fafafa',
    section: 'accounts',
    title: 'Color for Striped Transaction Rows',
    description:
      'When the Striped Transaction Rows feature is enabled, alternating rows use this color as the background. The default is #fafafa.',
  },
  {
    name: 'AccountsStripedRowsDarkColor',
    type: 'color',
    default: '#1e1e1f',
    section: 'accounts',
    title: 'Color for Striped Transaction Rows - Dark Theme',
    description:
      'When the Striped Transaction Rows feature is enabled, in dark theme, alternating rows use this color as the background. The default is #1e1e1f.',
  },
];
