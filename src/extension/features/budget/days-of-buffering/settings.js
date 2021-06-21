module.exports = [
  {
    name: 'DaysOfBuffering',
    type: 'select',
    default: '0',
    section: 'budget',
    title: 'Days of Buffering Metric',
    description:
      "This calculation shows how long your money would likely last if you never earned another cent based on your average spending. We know that no month is 'average' but this should give you some idea of how much of a buffer you have. Equal to budget accounts total divided by the average daily outflow. That comes from sum of all outflow transactions from on budget accounts only divided by the age of budget in days. You can also change the number of days taken into account by this metric with the 'Days of Buffering History Lookup' setting. Optionally, can exclude negative credit card balances. (better accuracy when carrying credit debt)",
    options: [
      { name: 'Disabled', value: '0' },
      { name: 'Days of Buffering', value: '1' },
      { name: 'Days of Buffering (no credit cards)', value: '2' },
    ],
  },
  {
    name: 'DaysOfBufferingHistoryLookup',
    type: 'select',
    default: '0',
    section: 'budget',
    title: 'Days of Buffering History Lookup',
    description: 'How old transactions should be used for average daily outflow calculation.',
    options: [
      { name: 'All', value: '0' },
      { name: '1 year', value: '12' },
      { name: '6 months', value: '6' },
      { name: '3 months', value: '3' },
      { name: '1 month', value: '1' },
    ],
  },
  {
    name: 'DaysOfBufferingDate',
    type: 'checkbox',
    default: false,
    section: 'budget',
    title: 'Days Of Buffering Metric - Date',
    description:
      'Hover the mouse over Days of Buffering to display the equivalent Date for Days of Buffering.\n For example, on 1st January with Days of Buffering = 10, Date of Buffering would be 11th January.',
  },
];
