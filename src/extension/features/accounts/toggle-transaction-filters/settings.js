module.exports = {
  name: 'ToggleTransactionFilters',
  type: 'select',
  default: '0',
  section: 'accounts',
  title: 'Toggle Scheduled and Reconciled Transaction Buttons',
  description: 'Easily show and hide scheduled and reconciled transactions with one click.',
  options: [
    { name: 'Disabled', value: '0' },
    { name: 'Show Icons', value: '1' },
    { name: 'Show Icons and Text Labels', value: '2' },
  ],
};
