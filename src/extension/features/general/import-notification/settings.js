module.exports = {
  name: 'ImportNotification',
  type: 'select',
  default: false,
  section: 'general',
  title: 'Emphasize Accounts Needing Import',
  description:
    'Adds an underline to account names in the sidebar that have transactions to be imported. Hovering over the account name will display the number of transactions waiting to be imported.',
  options: [
    { name: 'Underline in white', value: '1' },
    { name: 'Underline in red', value: '2' },
  ],
};
