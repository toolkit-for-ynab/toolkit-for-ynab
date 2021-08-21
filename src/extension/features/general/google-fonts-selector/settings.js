module.exports = {
  name: 'GoogleFontsSelector',
  type: 'select',
  default: false,
  section: 'general',
  title: 'Modify Interface Font',
  description: 'Select a font from the Google Fonts library or choose to use your system font.',
  options: [
    { name: 'Open Sans', value: '1' },
    { name: 'Roboto', value: '2' },
    { name: 'Roboto Condensed', value: '3' },
    { name: 'Droid Sans', value: '4' },
    { name: 'Inconsolata', value: '5' },
    { name: 'System font', value: '6' },
  ],
};
