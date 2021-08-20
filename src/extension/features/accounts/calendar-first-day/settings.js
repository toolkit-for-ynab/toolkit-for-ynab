module.exports = {
  name: 'CalendarFirstDay',
  type: 'select',
  default: false,
  section: 'accounts',
  title: 'Modify First Day of the Week',
  description:
    'Adjust the first day of the week in the calendar to whichever day you chose when editing or adding a transaction.',
  options: [
    { name: 'Monday', value: '1' },
    { name: 'Tuesday', value: '2' },
    { name: 'Wednesday', value: '3' },
    { name: 'Thursday', value: '4' },
    { name: 'Friday', value: '5' },
    { name: 'Saturday', value: '6' },
  ],
};
