module.exports = {
  name: 'CalendarFirstDay',
  type: 'select',
  default: '0',
  section: 'accounts',
  title: 'First Day of the Week in Calendar',
  description: 'Change the first day of the week when viewing the calendar.',
  options: [
    { name: 'Default (Sunday)', value: '0' },
    { name: 'Monday', value: '1' },
    { name: 'Tuesday', value: '2' },
    { name: 'Wednesday', value: '3' },
    { name: 'Thursday', value: '4' },
    { name: 'Friday', value: '5' },
    { name: 'Saturday', value: '6' },
  ],
};
