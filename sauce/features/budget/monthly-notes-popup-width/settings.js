module.exports = {
  name: 'MonthlyNotesPopupWidth',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Larger Clickable Area for Icons',
  description: 'Makes the uncleared, cleared and reconciled icons easier to select.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Medium', value: '1' },
    { name: 'Large', value: '2' }
  ]
};
