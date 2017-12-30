module.exports = {
  name: 'CheckCreditBalances',
  type: 'select',
  default: "disabled",
  section: 'budget',
  title: 'Paid in Full Credit Card Assist',
  description: 'This keeps track of Credit Card Payments that aren\'t fully budgeted by either highlighting and providing a rectify button or automatically rectifying.',
  options: [
    { name: "Disabled", value: "disabled" },
    { name: "Highlight mismatch In yellow and add rectify button to the inspector.", value: "highlight" },
    { name: "Automatically rectify all accounts.", value: "rectify" },
    { name: "Automatically rectify accounts with '#PIF' in the name only.", value: "rectifyPIF" },
  ]
};
