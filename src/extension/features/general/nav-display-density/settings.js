module.exports = {
  name: 'NavDisplayDensity',
  type: 'select',
  default: '0',
  section: 'general',
  title: 'Navigation Tabs Height',
  description:
    'Makes the navigation tabs (Budget, Reports, etc) smaller, and with less padding, so that you can see more of the sidebar on the screen.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Compact', value: '1' },
    { name: 'Slim', value: '2' },
  ],
};
