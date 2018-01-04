module.exports = {
  name: 'CheckCreditBalances',
  type: 'select',
  default: 0,
  section: 'budget',
  title: 'Paid in Full Credit Card Assist',
  description: 'This keeps track of Credit Card Payments that aren\'t fully budgeted by either highlighting and providing a rectify button or automatically rectifying.',
  options: [
    { name: "Disabled", value: 0 },
    { name: "Highlight mismatch In yellow and add rectify button to the inspector.", value: 1 },
    { name: "Automatically rectify all accounts.", value: 2 },
    { name: "Automatically rectify accounts with '#PIF' in the name only.", value: 3 },
  ]
};
