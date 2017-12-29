module.exports = {
  name: 'CheckCreditBalances',
  type: 'select',
  default: false,
  section: 'budget',
  title: 'Paid in Full Credit Card Assist',
  description: 'This keeps track of Credit Card Payments that aren\'t fully budgeted by either highlighting and providing a rectify button or automatically rectifying..',
  options: [
    { "name": "Disabled", "value": "disabled" },
    { "name": "Highlight Mismatch In Yellow and add Rectify Button to the inspector", "value": "highlight" },
    { "name": "Automatically Rectify", "value": "rectify" },
    { "name": "Automatically Rectify accounts with '#PIF' in the name only", "value": "rectifyPIF" },
  ], 
  actions: {
    "highlight": [
      "injectCSS", "main.css",
      "injectScript", "main.js"
    ],
    "rectify": [
      "injectCSS", "main.css",
      "injectScript", "main.js"
    ],
    "rectifyPIF": [
      "injectCSS", "main.css",
      "injectScript", "main.js"
    ]
  }
};

