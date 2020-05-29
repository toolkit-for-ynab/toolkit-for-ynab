module.exports = {
  name: 'CategorySoloMode',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Toggle Master Categories',
  description:
    'Adds ability to toggle all master categories at once. Alternatively, "Solo Mode" can be used to toggle all but a single category at once.',
  options: [
    { name: 'Off', value: '0' },
    { name: 'Enable Category Solo Mode', value: 'cat-solo-mode' },
    { name: 'Enable Toggle All Categories', value: 'cat-toggle-all' },
    { name: 'Enable both', value: 'cat-solo-mode-toggle-all' },
  ],
};
