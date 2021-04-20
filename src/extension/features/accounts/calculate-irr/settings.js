module.exports = [
  {
    name: 'CalculateIRR',
    type: 'select',
    default: 'disabled',
    section: 'accounts',
    title: 'Calculate Internal Rate of Return',
    description:
      'Calculate Internal Rate of Return for Tracking Accounts. Set Tracking Account contributions to this color to calculate IRR',
    options: [
      { name: 'disabled', value: null },
      { name: 'Red', value: 'Red' },
      { name: 'Orange', value: 'Orange' },
      { name: 'Yellow (Default Color)', value: 'Yellow' },
      { name: 'Green', value: 'Green' },
      { name: 'Blue', value: 'Blue' },
      { name: 'Purple', value: 'Purple' },
    ],
  },
];
