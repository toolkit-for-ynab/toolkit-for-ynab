module.exports = {
  name: 'popupCalculator',
  type: 'checkbox',
  default: false,
  section: 'general',
  title: 'Popup Calculator',
  description: `
Provides the same calculator capability that YNAB4 had.
* Account Screen - when adding or editing a transaction, a new button is added to the left of the 'Save and add another' or 'Save' buttons. Click the button to display the calculator.
* Budget Screen - adds a new button to the right of the value in the BUDGETED column when the sub-category is selected. Click the button to display the calculator.
`,
  actions: {
    true: [
      'injectCSS', 'main.css',
      'injectScript', 'main.js',
      'injectScript', 'account/main.js',
      'injectCSS', 'account/main.css',
      'injectCSS', 'budget/main.css',
      'injectScript', 'budget/main.js'
    ]
  }
};
