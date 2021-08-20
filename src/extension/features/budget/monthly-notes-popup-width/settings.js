module.exports = {
  name: 'MonthlyNotesPopupWidth',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Adjust Monthly Notes Popup Size',
  description:
    "Makes the screen that pops up when you click on 'Enter a note...' below the month name wider so you can add more text.",
  options: [
    { name: 'Medium', value: '1' },
    { name: 'Large', value: '2' },
  ],
};
