module.exports = {
  name: 'DefaultCCToCleared',
  type: 'checkbox',
  default: false,
  section: 'accounts',
  title: 'Default credit card payments to Cleared Balance',
  description:
    "Change the default credit card payment value to use the Cleared balance instead of the working balance, to avoid overpaying credit card bills. *__Note__: If you don't have enough budgeted in Payment to cover the selected option, it will use the Payment value instead to avoid overbudgeting*",
};
