module.exports = {
  name: 'IncomeFromLastMonth',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Income From Last Month',
  description: 'Show total of incoming transactions for last month in the header.',
  options: [
    { name: 'Disabled', value: '0' },
    { name: 'Use previous month', value: '1' },
    { name: 'Use month before last', value: '2' },
    { name: 'Use two months before last', value: '3' },
    { name: 'Use three months before last', value: '4' },
  ],
};
