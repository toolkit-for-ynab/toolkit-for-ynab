module.exports = {
  name: 'EditAccountButton',
  type: 'select',
  default: '0',
  section: 'general',
  title: 'Hide Edit Account Button',
  description:
    'Allows you to hide the edit account button to help prevent accidentally clicking on it.',
  options: [{ name: 'Default', value: '0' }, { name: 'Hidden (right-click to edit)', value: '2' }],
};
