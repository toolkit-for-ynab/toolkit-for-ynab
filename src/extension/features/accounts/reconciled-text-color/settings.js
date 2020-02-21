module.exports = {
  name: 'ReconciledTextColor',
  type: 'select',
  default: false,
  section: 'accounts',
  title: 'Reconciled Text Colour',
  description:
    'Makes the text on reconciled transactions appear in a more obvious colour of your choosing.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Green', value: '1' },
    { name: 'Light gray', value: '2' },
    { name: 'Dark gray', value: '3' },
    { name: 'Dark gray with green background', value: '4' },
  ],
};
