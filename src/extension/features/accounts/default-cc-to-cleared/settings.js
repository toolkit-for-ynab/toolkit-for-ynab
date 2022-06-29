module.exports = {
  name: 'DefaultCCToCleared',
  type: 'checkbox',
  default: false,
  section: 'accounts',
  title: 'Use Cleared Balance for "Record Payment"',
  description:
    "Change the default credit card payment value to use the Cleared Balance instead of the Working Balance to avoid overpaying credit card bills. *__Note__: If you don't have enough budgeted in Payment to cover the selected option, it will use the Payment value instead to avoid overbudgeting*",
};
