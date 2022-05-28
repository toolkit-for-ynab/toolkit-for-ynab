module.exports = {
  name: 'SubtractUpcomingFromAvailable',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Subtract Upcoming Transactions from Available Balance',
  description:
    'Subtracts upcoming transactions from the available balance for each category.' +
    ' In other words, treat upcoming transactions as if the money has already been spent. Also shows "Available After Upcoming Transactions" in the budget breakdown.' +
    '\n\nAdditionally, this feature totals the amounts in the "Payment" column of your CC category group and subtracts that from the "Available After Upcoming Transactions" in the budget breakdown.' +
    ' This allows you to see how much you have available if you exclude the money "reserved" in your Credit Card Payments category group.' +
    ' You can turn this part of the feature off by selecting "Don\'t Include CC Payments".' +
    '\n\nIf the "Show Available After Savings" feature is enabled, the "Available After Savings" amount is used as the starting point for the budget breakdown calculations.',
  options: [
    { name: 'Subtract Upcoming from Available', value: '1' },
    { name: "Don't Include CC Payments", value: 'no-cc' },
  ],
  disabled: true,
};
