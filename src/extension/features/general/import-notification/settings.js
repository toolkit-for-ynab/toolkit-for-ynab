module.exports = {
  name: 'ImportNotification',
  type: 'select',
  default: '0',
  section: 'general',
  title: 'Show Import Notifications in Navigation Sidebar',
  description:
    'Underline account names in the navigation sidebar that have transactions to be imported. Hovering the mouse over the account name will display the number of transactions to be imported.',
  options: [
    { name: 'Off', value: '0' },
    { name: 'On - Underline account names in white', value: '1' },
    { name: 'On - Underline account names in red', value: '2' },
  ],
};
