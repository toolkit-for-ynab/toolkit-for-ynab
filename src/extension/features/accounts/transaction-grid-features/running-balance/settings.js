module.exports = {
  name: 'RunningBalance',
  type: 'select',
  default: '0',
  section: 'accounts',
  title: 'Show Running Balance',
  description:
    'Adds a running balance column to the accounts page (does not appear on All Accounts View)',
  options: [
    { name: 'Off', value: '0' },
    { name: 'On: Style any negative running balances red', value: '1' },
    { name: 'On: Do not style negative running balances', value: '2' },
  ],
  isSubFeature: true,
};
