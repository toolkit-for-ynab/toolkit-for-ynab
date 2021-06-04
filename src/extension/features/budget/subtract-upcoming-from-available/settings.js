module.exports = {
  name: 'SubtractUpcomingFromAvailable',
  type: 'checkbox',
  default: false,
  section: 'budget',
  title: 'Subtract Upcoming Transactions from Available Balance',
  description:
    'Subtracts upcoming transactions from the available balance for each category. In other words, treat upcoming transactions as if the money has already been spent. Also shows the total available after upcoming transactions in the budget inspector.',
};
