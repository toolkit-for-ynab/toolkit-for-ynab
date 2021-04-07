module.exports = {
  name: 'LastReconciledDate',
  type: 'select',
  default: '0',
  section: 'accounts',
  title: 'Show Last Reconciliation Details',
  description:
    'Show the last reconciled date and or days since last reconciled of the current account in the header',
  options: [
    { name: 'Disabled', value: '0' },
    { name: 'Date Last Reconciled', value: '1' },
    { name: 'Days Since Reconciled', value: '2' },
    { name: 'Both', value: '3' },
  ],
};
