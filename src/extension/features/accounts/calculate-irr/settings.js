module.exports = [
  {
    name: 'CalculateIRR',
    type: 'checkbox',
    default: false,
    section: 'accounts',
    title: 'Calculate Internal Rate of Return',
    description: 'Calculate Internal Rate of Return for Tracking Accounts.  Set Flag Color below.',
  },
  {
    name: 'CalculateIRRflagColor',
    type: 'select',
    default: 'Yellow',
    section: 'accounts',
    title: 'Calculate Internal Rate of Return Flag Color',
    description: 'Set Tracking Account contributions to this color to calculate IRR',
    options: [
      { name: 'Red', value: 'Red' },
      { name: 'Orange', value: 'Orange' },
      { name: 'Yellow (Default)', value: 'Yellow' },
      { name: 'Green', value: 'Green' },
      { name: 'Blue', value: 'Blue' },
      { name: 'Purple', value: 'Purple' },
    ],
  },
];
