module.exports = {
  name: 'LastReconciledDate',
  type: 'select',
  default: '0',
  section: 'accounts',
  title: 'Show Last Reconciliation Details',
  description:
    'Show the last reconciled date and or days since last reconciled of the current account in the header',
  options: [
    { name: 'Disabled', value: 'disabled' },
    { name: 'Date Last Reconciled', value: 'last-date' },
    { name: 'Days Since Reconciled', value: 'days-since' },
    { name: 'Both', value: 'last-date-days-since' },
  ],
};
