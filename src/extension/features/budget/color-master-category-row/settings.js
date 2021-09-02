module.exports = [
  {
    name: 'MasterCategoryRowColor',
    type: 'checkbox',
    default: false,
    section: 'budget',
    title: 'Colored Master Category Row',
    description: 'Adds Color to Master Category Row.',
  },
  {
    name: 'MasterCategoryRowColorSelect',
    type: 'color',
    default: '#d1d1d6',
    section: 'budget',
    title: 'Colored Master Category Row - Default/Classic Theme Color',
    description:
      'The color which will be used for the Default and Classic YNAB Themes. The default is #d1d1d6.',
  },
  {
    name: 'MasterCategoryRowDarkColorSelect',
    type: 'color',
    default: '#636366',
    section: 'budget',
    title: 'Colored Master Category Row - Dark Theme Color',
    description: 'The color which will be used for the Dark YNAB Theme. The default is #636366.',
  },
];
