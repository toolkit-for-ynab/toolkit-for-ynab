module.exports = {
  name: 'CustomAverageBudgeting',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Add Custom Average Month Quick Budget',
  description: 'Select an average month count to calculate a quick budget option with',
  options: [
    { name: '3 months', value: '3' },
    { name: '6 months', value: '6' },
    { name: '12 months', value: '12' },
  ],
};
