import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getSelectedMonth } from 'toolkit/extension/utils/ynab';
import * as categories from 'toolkit/extension/features/budget/subtract-upcoming-from-available/categories';
import * as totals from 'toolkit/extension/features/budget/subtract-upcoming-from-available/totals';
import * as util from 'toolkit/extension/features/budget/subtract-upcoming-from-available/util';

export function handleBudgetBreakdown(element) {
  if (!util.shouldInvoke()) return;

  const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
  const $budgetBreakdownAvailableBalance = $('.budget-breakdown-available-balance', element);
  const $budgetBreakdownTotals = $budgetBreakdownMonthlyTotals.length
    ? $budgetBreakdownMonthlyTotals
    : $budgetBreakdownAvailableBalance.length
    ? $budgetBreakdownAvailableBalance
    : undefined;
  const budgetBreakdown = getEmberView(element.id);
  if ($budgetBreakdownTotals && budgetBreakdown)
    addTotalAvailableAfterUpcoming(budgetBreakdown, $budgetBreakdownTotals);
}

function addTotalAvailableAfterUpcoming(budgetBreakdown, context) {
  $('#total-previous-upcoming', context).remove();
  $('#total-upcoming', context).remove();
  $('#total-cc-payments', context).remove();
  $('#total-available-after-upcoming', context).remove();
  $('#available-after-upcoming-hr', context).remove();

  const categoriesObject = categories.getCategoriesObject();

  const totalAvailable = ynabToolKit.options.ShowAvailableAfterSavings
    ? budgetBreakdown.budgetTotals.available - totals.getTotalSavings(budgetBreakdown)
    : budgetBreakdown.budgetTotals.available;

  const currentMonth = ynab.utilities.DateWithoutTime.createForCurrentMonth();
  const includePreviousUpcoming = getSelectedMonth().isAfter(currentMonth);
  const totalPreviousUpcoming = includePreviousUpcoming
    ? totals.getTotalPreviousUpcoming(budgetBreakdown, categoriesObject)
    : 0;

  const totalUpcoming = totals.getTotalUpcoming(budgetBreakdown, categoriesObject);

  const noCC = ynabToolKit.options.SubtractUpcomingFromAvailable === 'no-cc';
  const totalCCPayments = !noCC ? totals.getTotalCCPayments(budgetBreakdown) : 0;
  const includeCCPayments = !!totalCCPayments; // Don't include CC payments if total is 0.

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
  const $budgetBreakdownEntries = $(entries);

  const $totalAvailableAfterSavings = $('#total-available-after-savings');
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

  return $ynabAvailableAfterUpcoming.length ? $ynabAvailableAfterUpcoming : false;
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
