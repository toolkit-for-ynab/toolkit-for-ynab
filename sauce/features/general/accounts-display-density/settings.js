module.exports = {
  name: 'AccountsDisplayDensity',
  type: 'select',
  default: false,
  section: 'general',
  title: 'Account Name Height',
  description: 'Makes the account names smaller so that you can see more of the account names and fit more on the screen.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' }
  ]
};
