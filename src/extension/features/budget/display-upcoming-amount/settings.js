module.exports = [
  {
    name: 'DisplayUpcomingAmount',
    type: 'checkbox',
    default: false,
    section: 'budget',
    title: 'Show Upcoming Transaction Total',
    description: 'Add the total of upcoming transactions alongside activity for each category.',
  },
  {
    name: 'DisplayUpcomingAmountColor',
    type: 'color',
    default: '#64748B',
    section: 'budget',
    title: 'Show Upcoming Transaction Total: Color',
    description: 'Select a custom color for the upcoming transaction totals.',
  },
];
