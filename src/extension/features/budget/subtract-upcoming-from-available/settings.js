module.exports = {
  name: 'SubtractUpcomingFromAvailable',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Subtract Upcoming Transactions from Available Balance',
  description:
    'Subtracts upcoming transactions from the available balance for each category.' +
    ' In other words, treat upcoming transactions as if the money has already been spent. Also shows "Available After Upcoming Transactions" in the budget breakdown.' +
    '\n\nEnabling "Subtract Credit Card Balances from Total Available" totals the amounts in the "Payment" column' +
    ' of your CC category group and subtracts that from the "Available After Upcoming Transactions" in the budget breakdown.' +
    ' This allows you to see how much you have available if you exclude the money "reserved" in your Credit Card Payments category group.' +
    ' (Probably only useful if you pay off your CCs in full every month.)',
  options: [
    { name: 'Both', value: 'both' },
    { name: 'Subtract Upcoming from Available', value: 'upcoming-only' },
    { name: 'Subtract Credit Card Balances from Total Available', value: 'cc-only' },
  ],
};
