module.exports = {
  name: 'MonthlyNotesPopupWidth',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Width of Monthly Notes Popup',
  description:
    "Makes the screen that pops up when you click on 'Enter a note...' below the month name wider so you can add more text.",
  options: [
    { name: 'Default', value: '0' },
    { name: 'Medium', value: '1' },
    { name: 'Large', value: '2' },
  ],
};
