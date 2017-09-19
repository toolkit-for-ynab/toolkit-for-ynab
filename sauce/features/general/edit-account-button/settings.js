module.exports = {
  name: 'EditAccountButton',
  type: 'select',
  default: '0',
  section: 'general',
  title: 'Edit Account Button Position',
  description: 'Allows you to move or hide the edit account button to help prevent accidentally clicking on it.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Left of name', value: '1' },
    { name: 'Hidden', value: '2' }
  ]
};
