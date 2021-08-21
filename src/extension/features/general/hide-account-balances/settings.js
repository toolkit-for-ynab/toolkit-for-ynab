module.exports = {
  name: 'HideAccountBalancesType',
  type: 'select',
  default: false,
  section: 'general',
  title: 'Hide Account Balances',
  description: 'Allows you to hide account type totals and/or account balances.',
  options: [
    { name: 'Hide All', value: '1' },
    { name: 'Hide Account Type Totals', value: '2' },
    { name: 'Hide Account Balances', value: '3' },
  ],
};
