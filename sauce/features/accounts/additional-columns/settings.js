module.exports = [
  {
    name: 'AdditionalColumns',
    section: 'system',
    default: true
  },
  {
    name: 'RunningBalance',
    type: 'checkbox',
    default: false,
    section: 'accounts',
    title: 'Show Running Balance',
    description: 'Adds a running balance column to the accounts page (does not appear on All Accounts View)'
  },
  {
    name: 'CheckNumbers',
    type: 'checkbox',
    default: false,
    section: 'accounts',
    title: 'Add Check Number Column',
    description: 'Adds the check number column to your account view.'
  }
];
