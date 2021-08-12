import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import * as categories from 'toolkit/extension/features/budget/subtract-upcoming-from-available/categories';
import * as util from 'toolkit/extension/features/budget/subtract-upcoming-from-available/util';

export function handleBudgetBreakdown(element) {
  if (!util.shouldRun()) return;

  const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
  const $budgetBreakdownAvailableBalance = $('.budget-breakdown-available-balance', element);
  const $budgetBreakdownTotals = $budgetBreakdownMonthlyTotals.length
    ? $budgetBreakdownMonthlyTotals
    : $budgetBreakdownAvailableBalance.length
    ? $budgetBreakdownAvailableBalance
    : undefined;
  if (!$budgetBreakdownTotals) return;

  // Remove budget breakdown entries if they exist.
  $('#total-previous-upcoming', $budgetBreakdownTotals).remove();
  $('#total-upcoming', $budgetBreakdownTotals).remove();
  $('#total-cc-payments', $budgetBreakdownTotals).remove();
  $('#total-available-after-upcoming', $budgetBreakdownTotals).remove();
  $('#available-after-upcoming-hr', $budgetBreakdownTotals).remove();

  const budgetBreakdown = getEmberView(element.id);
  if (!budgetBreakdown) return;

  const totals = categories.getTotals(budgetBreakdown.inspectorCategories);
  if (!totals) return;

  updateBudgetBreakdown(totals, budgetBreakdown, $budgetBreakdownTotals);
}

function updateBudgetBreakdown(totals, budgetBreakdown, context) {
  const totalAvailable = ynabToolKit.options.ShowAvailableAfterSavings
    ? budgetBreakdown.budgetTotals.available - totals.totalSavings
    : budgetBreakdown.budgetTotals.available;

  const totalPreviousUpcoming = totals.totalPreviousUpcoming;
  const includePreviousUpcoming = !!totalPreviousUpcoming; // Don't include totalPreviousUpcoming if total is 0.

  const totalUpcoming = totals.totalUpcoming;

  const noCC = ynabToolKit.options.SubtractUpcomingFromAvailable === 'no-cc';
  const totalCCPayments = !noCC ? totals.totalCCPayments : 0;
  const includeCCPayments = !!totalCCPayments; // Don't include totalCCPayments if total is 0.

  const totalAvailableAfterUpcoming =
    totalAvailable + totalPreviousUpcoming + totalUpcoming - totalCCPayments;

  if (totalAvailableAfterUpcoming === totalAvailable) return;

  // When one category is selected, YNAB provides its own "Available After Upcoming" so we edit that instead of adding ours.
  const $ynabAvailableAfterUpcoming = getYnabAvailableAfterUpcoming(context);
  if ($ynabAvailableAfterUpcoming)
    editYnabAvailableAfterUpcoming(
      totalAvailableAfterUpcoming, // Subtract totalCCPayments?
      $ynabAvailableAfterUpcoming,
      context
    );

  const entries = [];
  if (includePreviousUpcoming)
    entries.push(getBudgetBreakdownEntry('totalPreviousUpcoming', totalPreviousUpcoming));
  entries.push(getBudgetBreakdownEntry('totalUpcoming', totalUpcoming));
  if (includeCCPayments) entries.push(getBudgetBreakdownEntry('totalCCPayments', -totalCCPayments)); // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
  entries.push(getBudgetBreakdownEntry('totalAvailableAfterUpcoming', totalAvailableAfterUpcoming));
  entries.push($('<div id="available-after-upcoming-hr"><hr style="width:100%"></div>'));

  let $budgetBreakdownEntries = $();
  for (const budgetBreakdownEntry of entries) {
    $budgetBreakdownEntries = $budgetBreakdownEntries.add(budgetBreakdownEntry);
  }

  const $totalAvailableAfterSavings = $('#total-available-after-savings', context);
  const $ynabBreakdown = $('.ynab-breakdown', context);

  if (ynabToolKit.options.ShowAvailableAfterSavings && $totalAvailableAfterSavings.length)
    $budgetBreakdownEntries.insertAfter($totalAvailableAfterSavings);
  else $budgetBreakdownEntries.prependTo($ynabBreakdown);
}

function getYnabAvailableAfterUpcoming(context) {
  const localizedMessageText = l10n(
    'inspector.availableMessage.afterUpcoming',
    'Available After Upcoming'
  );

  const $ynabAvailableAfterUpcoming = $('.inspector-message-label', context).filter(function () {
    return this.innerText === localizedMessageText;
  });

  return $ynabAvailableAfterUpcoming.length && $ynabAvailableAfterUpcoming;
}

function editYnabAvailableAfterUpcoming(amount, $ynabAvailableAfterUpcoming, context) {
  const $inspectorMessageRow = $($ynabAvailableAfterUpcoming, context).parent();

  const classes = 'positive zero negative';

  const $inspectorMessage = $($inspectorMessageRow, context).parent();
  $inspectorMessage.removeClass(classes);
  $inspectorMessage.addClass(amount >= 0 ? 'positive' : 'negative');

  const $availableAfterUpcomingText = $('.user-data', $inspectorMessageRow);
  $availableAfterUpcomingText.text(formatCurrency(amount));
  $availableAfterUpcomingText.removeClass(classes);
  $availableAfterUpcomingText.addClass(util.getCurrencyClass(amount));
}

function getBudgetBreakdownEntry(key, amount) {
  const entry = budgetBreakdownEntries[key];
  return util.createBudgetBreakdownEntry(entry[0], entry[1], entry[2], amount);
}

const budgetBreakdownEntries = {};

budgetBreakdownEntries.totalPreviousUpcoming = [
  'total-previous-upcoming',
  'toolkit.totalPreviousUpcoming',
  'Upcoming Transactions (Previous Months)',
];

budgetBreakdownEntries.totalUpcoming = [
  'total-upcoming',
  'toolkit.totalUpcoming',
  'Upcoming Transactions (This Month)',
];

budgetBreakdownEntries.totalCCPayments = [
  'total-cc-payments',
  'toolkit.totalCCPayments',
  'CC Payments',
];

budgetBreakdownEntries.totalAvailableAfterUpcoming = [
  'total-available-after-upcoming',
  'toolkit.availableAfterUpcoming',
  'Available After Upcoming Transactions',
];
