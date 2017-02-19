module.exports = {
  name: 'popupCalculator',
  type: 'checkbox',
  default: false,
  section: 'general',
  title: 'Popup Calculator',
  description: `
Adds the total available balance to the category tooltip on each row in the Accounts register.

* Item 1
* Item 2
* Item 3
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
