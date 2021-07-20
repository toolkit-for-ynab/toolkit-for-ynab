module.exports = {
  name: 'SubtractUpcomingFromAvailable',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Subtract Upcoming Transactions from Available Balance',
  description:
    'Subtracts upcoming transactions from the available balance for each category.' +
    ' In other words, treat upcoming transactions as if the money has already been spent. Also adds "Available After Upcoming Transactions" to the budget breakdown.' +
    '\n\nEnabling "Subtract Credit Card Balances from Total Available" will total the amounts in the "Payment" column' +
    ' of your CC category group and subtract that from the "Available After Upcoming Transactions" in the budget breakdown.' +
    ' This allows to see how much you have available, excluding the money "reserved" in your Credit Card Payments category group.' +
    ' (Probably only useful if you pay off your CCs in full every month.)',
  options: [
    { name: 'Disabled', value: '0' },
    { name: 'Both', value: 'both' },
    { name: 'Subtract Upcoming from Available', value: 'upcoming-only' },
    { name: 'Subtract Credit Card Balances from Total Available', value: 'cc-only' },
  ],
};
