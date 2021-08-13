import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import * as categories from './categories';
import * as util from './util';

export function handleBudgetBreakdown(element) {
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

  if (!util.shouldRun()) return;

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

  const $ynabBreakdown = $('.ynab-breakdown', context);

  const inspectorMessageEntries = [];
  if (includePreviousUpcoming)
    inspectorMessageEntries.push(
      getInspectorMessageEntry('previousUpcoming', totalPreviousUpcoming)
    );
  if (includeCCPayments)
    inspectorMessageEntries.push(getInspectorMessageEntry('CCPayment', -totalCCPayments)); // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
  const $inspectorMessageEntries = $buildEntries(inspectorMessageEntries);

  // When one category is selected, YNAB provides its own "Available After Upcoming" so we edit that instead of adding ours.
  const $ynabAvailableAfterUpcoming = getYnabAvailableAfterUpcoming(context);
  if ($ynabAvailableAfterUpcoming) {
    editYnabAvailableAfterUpcoming(
      totalAvailableAfterUpcoming,
      $inspectorMessageEntries,
      $ynabAvailableAfterUpcoming,
      $ynabBreakdown,
      context
    );
    return;
  }

  const budgetBreakdownEntries = [];
  if (includePreviousUpcoming)
    budgetBreakdownEntries.push(
      getBudgetBreakdownEntry('totalPreviousUpcoming', totalPreviousUpcoming)
    );
  budgetBreakdownEntries.push(getBudgetBreakdownEntry('totalUpcoming', totalUpcoming));
  if (includeCCPayments)
    budgetBreakdownEntries.push(getBudgetBreakdownEntry('totalCCPayments', -totalCCPayments)); // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
  budgetBreakdownEntries.push(
    getBudgetBreakdownEntry('totalAvailableAfterUpcoming', totalAvailableAfterUpcoming)
  );
  budgetBreakdownEntries.push(
    $('<div id="available-after-upcoming-hr"><hr style="width:100%"></div>')
  );
  const $budgetBreakdownEntries = $buildEntries(budgetBreakdownEntries);

  const $totalAvailableAfterSavings = $('#total-available-after-savings', context);

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

function editYnabAvailableAfterUpcoming(
  totalAvailableAfterUpcoming,
  $entries,
  $ynabAvailableAfterUpcoming,
  $ynabBreakdown,
  context
) {
  const $inspectorMessageRow = $($ynabAvailableAfterUpcoming, context).parent();
  const $inspectorMessage = $($inspectorMessageRow, context).parent();
  const $inspectorMessageBox = $($inspectorMessage, context).parent();
  $inspectorMessageBox.insertBefore($ynabBreakdown).css('margin-bottom', '8px');
  $ynabBreakdown.css('margin-bottom', '0px');

  $('#inspector-message-previous-upcoming', $inspectorMessage).remove();
  $('#inspector-message-cc-payment', $inspectorMessage).remove();

  $entries.insertBefore($inspectorMessageRow);

  const classes = 'positive zero negative';
  $inspectorMessage.removeClass(classes);
  $inspectorMessage.addClass(totalAvailableAfterUpcoming >= 0 ? 'positive' : 'negative');

  const $availableAfterUpcomingText = $('.user-data', $inspectorMessageRow);
  $availableAfterUpcomingText.text(formatCurrency(totalAvailableAfterUpcoming));
  $availableAfterUpcomingText.removeClass(classes);
  $availableAfterUpcomingText.addClass(util.getCurrencyClass(totalAvailableAfterUpcoming));
}

function $buildEntries(entries) {
  let $entries = $();
  for (const budgetBreakdownEntry of entries) {
    $entries = $entries.add(budgetBreakdownEntry);
  }
  return $entries;
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
  'Credit Card Payments',
];

budgetBreakdownEntries.totalAvailableAfterUpcoming = [
  'total-available-after-upcoming',
  'toolkit.availableAfterUpcoming',
  'Available After Upcoming Transactions',
];

function getInspectorMessageEntry(key, amount) {
  const entry = inspectorMessageEntries[key];
  return util.createInspectorMessageEntry(entry[0], entry[1], entry[2], amount);
}

const inspectorMessageEntries = {};

inspectorMessageEntries.previousUpcoming = [
  'inspector-message-previous-upcoming',
  'toolkit.inspectorMessagePreviousUpcoming',
  'Upcoming Transactions (Previous Months)',
];

inspectorMessageEntries.CCPayment = [
  'inspector-message-cc-payment',
  'toolkit.inspectorMessageCCPayment',
  'Remaining Payment',
];
