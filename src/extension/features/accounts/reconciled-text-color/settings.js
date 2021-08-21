module.exports = {
  name: 'ReconciledTextColor',
  type: 'select',
  default: false,
  section: 'accounts',
  title: 'Emphasize Reconciled Transactions',
  description:
    'Add emphasis to reconciled transaction rows to better distinguish them from "active" transactions.',
  options: [
    { name: 'Green', value: '1' },
    { name: 'Light gray', value: '2' },
    { name: 'Dark gray', value: '3' },
    { name: 'Dark gray with green background', value: '4' },
  ],
};
