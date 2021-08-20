module.exports = {
  name: 'NavDisplayDensity',
  type: 'select',
  default: false,
  section: 'general',
  title: 'Adjust Navigation Tabs Height',
  description:
    'Make the navigation tab names (Budget, Reports, etc) and their padding smaller allowing more content to fit on the screen.',
  options: [
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
  ],
};
