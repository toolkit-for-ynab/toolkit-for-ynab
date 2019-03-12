module.exports = {
  name: 'DisplayTargetGoalAmount',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Display Target Goal Amount And Overbudget Warning',
  description:
    "Adds a 'Goal' column which displays the target goal amount for every category with a goal, and a warning in red if you have budgeted beyond your goal.",
  options: [
    { name: 'Do not display goal amount (default)', value: '0' },
    { name: 'Display goal amount and warn of overbudget with red', value: '1' },
    { name: 'Display goal amount but show overbudget as green', value: '2' },
    { name: 'Display goal amount with no emphasis', value: '3' },
  ],
};
