module.exports = {
  name: 'CoverOverspendingFromFuture',
  type: 'checkbox',
  default: false,
  section: 'budget',
  title: 'Cover Overspending from Future Option',
  description: 'This option adds a quick budget button to the inspector if the available amount is negative. This button is enabled when there is money budgeted in the future in this category, and wil pull from the furthest month if clicked.'
};
