module.exports = {
  name: 'RemoveZeroCategories',
  type: 'checkbox',
  default: false,
  section: 'budget',
  title: 'Remove Zero and Negative Categories When Covering Over-Budgeting',
  description: `
Default YNAB behaviour is to show these categories when covering overbudgeting, but since they've got no money in them they won't help you. Let's clean up the menu.
`,
};
