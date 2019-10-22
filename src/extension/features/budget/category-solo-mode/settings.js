module.exports = {
  name: 'CategorySoloMode',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Category Solo Mode and Toggle All Categories',
  description:
    'Keeps only the selected category open collapsing all others and adds a button to the Budget Toolbar to open or close all master categories at once.',
  options: [
    { name: 'Off', value: '0' },
    { name: 'Enable Category Solo Mode', value: 'cat-solo-mode' },
    { name: 'Enable Toggle All Categories', value: 'cat-toggle-all' },
    { name: 'Enable both', value: 'cat-solo-mode-toggle-all' },
  ],
};
