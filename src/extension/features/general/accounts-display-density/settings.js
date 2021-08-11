module.exports = {
  name: 'AccountsDisplayDensity',
  type: 'select',
  default: false,
  section: 'general',
  title: 'Adjust Account Name Height',
  description:
    'Make the account names and their padding in the sidebar smaller allowing more accounts to fit on the screen.',
  options: [
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
  ],
};
