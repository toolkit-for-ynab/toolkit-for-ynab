module.exports = {
  name: 'CategoryActivityPopupWidth',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Width of Category Popup',
  description:
    'Makes the screen that pops up when you click on activity from a budget category wider so you can see more details of the transactions listed.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Medium', value: '1' },
    { name: 'Large', value: '2' },
  ],
};
