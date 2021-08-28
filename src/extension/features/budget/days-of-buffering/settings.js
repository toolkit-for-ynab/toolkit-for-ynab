module.exports = [
  {
    name: 'DaysOfBuffering',
    type: 'select',
    default: false,
    section: 'budget',
    title: 'Add Days of Buffering',
    description:
      "Add a calculation which shows how long your money would likely last if you never earned another cent based on your average spending from a chosen date range. We know that no month is 'average' but this should give you some idea of how much of a buffer you have. The actual calculation is the sum of all your budget accounts divided by the average daily outflow in the time range. Optionally, you can exclude negative credit card balances for better accuracy when carrying credit card debt.",
    options: [
      { name: 'Look Back Infinitely', value: 'all' },
      { name: 'Look Back 1 Year', value: '12' },
      { name: 'Look Back 6 Months', value: '6' },
      { name: 'Look Back 3 Months', value: '3' },
      { name: 'Look Back 1 Month', value: '1' },
    ],
  },
  {
    name: 'DaysOfBufferingExcludeCreditCards',
    type: 'checkbox',
    default: false,
    section: 'budget',
    title: 'Add Days of Buffering - Exclude Credit Cards',
    description:
      'Option to exclude credit cards from the days of buffering calculation, this will usually eliminate negative calculations for Days of Buffering but it should be noted that this will also inflate you "Days of Buffering" as far as the actual calculation goes.',
  },
];
