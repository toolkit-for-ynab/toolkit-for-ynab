import { getEmberView } from 'toolkit/extension/utils/ember';
import * as categories from './categories';
import * as util from './util';

export function handleBudgetBreakdownMonthlyTotals(element) {
  if (!util.shouldRun()) return;

  const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
  if (!$budgetBreakdownMonthlyTotals.length) return;

  // Remove budget breakdown entries if they exist.
  removeBudgetBreakdownEntries();

  const budgetBreakdown = getEmberView(element.id);
  if (!budgetBreakdown) return;

  const totals = categories.getTotals(budgetBreakdown);
  if (!totals) return;

  updateBudgetBreakdown(totals, $budgetBreakdownMonthlyTotals);
}

export function removeBudgetBreakdownEntries() {
  $('#tk-total-previous-upcoming').remove();
  $('#tk-total-upcoming').remove();
  $('#tk-total-cc-payments').remove();
  $('#tk-total-available-after-upcoming').remove();
  $('#available-after-upcoming-hr').remove();
}

function updateBudgetBreakdown(totals, context) {
  const { totalPreviousUpcoming, totalUpcoming, totalCCPayments, totalAvailableAfterUpcoming } =
    totals;

  const budgetBreakdownEntries = [];
  if (totalPreviousUpcoming)
    budgetBreakdownEntries.push(
      getBudgetBreakdownEntry('totalPreviousUpcoming', totalPreviousUpcoming)
    );
  budgetBreakdownEntries.push(getBudgetBreakdownEntry('totalUpcoming', totalUpcoming));
  if (totalCCPayments)
    budgetBreakdownEntries.push(getBudgetBreakdownEntry('totalCCPayments', -totalCCPayments)); // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
  budgetBreakdownEntries.push(
    getBudgetBreakdownEntry('totalAvailableAfterUpcoming', totalAvailableAfterUpcoming)
  );
  budgetBreakdownEntries.push(
    $('<div id="available-after-upcoming-hr"><hr style="width:100%"></div>')
  );
  const $budgetBreakdownEntries = util.$buildEntries(budgetBreakdownEntries);

  const $totalAvailableAfterSavings = $('#total-available-after-savings', context);
  const $ynabBreakdown = $('.ynab-breakdown', context);

  if (ynabToolKit.options.ShowAvailableAfterSavings && $totalAvailableAfterSavings.length)
    $budgetBreakdownEntries.insertAfter($totalAvailableAfterSavings);
  else $budgetBreakdownEntries.prependTo($ynabBreakdown);
}

function getBudgetBreakdownEntry(key, amount) {
  const entry = budgetBreakdownEntries[key];
  return util.createBudgetBreakdownEntry(entry[0], entry[1], entry[2], amount);
}

const budgetBreakdownEntries = {};

budgetBreakdownEntries.totalPreviousUpcoming = [
  'tk-total-previous-upcoming',
  'toolkit.totalPreviousUpcoming',
  'Upcoming Transactions (Previous Months)',
];

budgetBreakdownEntries.totalUpcoming = [
  'tk-total-upcoming',
  'toolkit.totalUpcoming',
  'Upcoming Transactions (This Month)',
];

budgetBreakdownEntries.totalCCPayments = [
  'tk-total-cc-payments',
  'toolkit.totalCCPayments',
  'Credit Card Payments',
];

budgetBreakdownEntries.totalAvailableAfterUpcoming = [
  'tk-total-available-after-upcoming',
  'toolkit.availableAfterUpcoming',
  'Available After Upcoming Transactions',
];
