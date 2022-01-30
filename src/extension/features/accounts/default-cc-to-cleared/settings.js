module.exports = {
  name: 'DefaultCCToCleared',
  type: 'select',
  default: false,
  section: 'accounts',
  title: 'Default credit card payments to Cleared Balance',
  description:
    'Change the default value automatically populated into the Inflow field by the "Record Payment" button for credit cards. *__Note__: If you don\'t have enough budgeted in Payment to cover the selected option, it will use the Payment value instead to avoid overbudgeting*',
  options: [
    {
      name: 'Populate Cleared Balance',
      value: 'cleared',
    },
    {
      name: 'Ask me whether to populate Cleared or Working Balance each time',
      value: 'ask',
    },
  ],
};
