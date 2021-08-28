module.exports = {
  name: 'ToggleTransactionFilters',
  type: 'select',
  default: false,
  section: 'accounts',
  title: 'Add "Scheduled" and "Reconciled" Toggle Buttons',
  description:
    'Add buttons to quickly show/hide either scheduled or reconciled transactions with one click.',
  options: [
    { name: 'Show Icons', value: '1' },
    { name: 'Show Icons and Text Labels', value: '2' },
  ],
};
