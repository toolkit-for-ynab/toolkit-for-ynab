module.exports = {
  name: 'CategoryActivityPopupWidth',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Adjust Category Activity Popup Size',
  description:
    'Makes the screen that pops up when you click on activity from a budget category wider so you can see more details of the transactions listed.',
  options: [
    { name: 'Medium', value: '1' },
    { name: 'Large', value: '2' },
  ],
};
