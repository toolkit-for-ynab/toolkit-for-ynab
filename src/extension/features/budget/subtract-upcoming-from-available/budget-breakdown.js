import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
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
  const totalUpcoming = totals.getTotalUpcoming(budgetBreakdown, categoriesObject);
  let totalAvailableAfterUpcoming = totalAvailable + totalUpcoming;

  // const isInCurrentMonthOrLater = !category.month.isBeforeMonth(currentMonth);

  // if
  const totalPreviousUpcoming = totals.getTotalPreviousUpcoming(budgetBreakdown, categoriesObject);
  totalAvailableAfterUpcoming += totalPreviousUpcoming;

  // When one category is selected, YNAB provides its own "Available After Upcoming" so we edit that instead of adding ours.
  const $ynabAvailableAfterUpcoming = getYnabAvailableAfterUpcoming(context);
  if ($ynabAvailableAfterUpcoming)
    editYnabAvailableAfterUpcoming(
      totalAvailableAfterUpcoming,
      $ynabAvailableAfterUpcoming,
      context
    );

  let $elements = $();

  const $totalPreviousUpcoming = util.createBudgetBreakdownEntry(
    'total-previous-upcoming',
    'toolkit.totalPreviousUpcoming',
    'Upcoming Transactions (Previous Months)',
    totalPreviousUpcoming
  );
  $elements = $elements.add($totalPreviousUpcoming);

  const $totalUpcoming = util.createBudgetBreakdownEntry(
    'total-upcoming',
    'toolkit.totalUpcoming',
    'Upcoming Transactions (This Month)',
    totalUpcoming
  );
  $elements = $elements.add($totalUpcoming);

  if (ynabToolKit.options.SubtractUpcomingFromAvailable !== 'no-cc') {
    const totalCCPayments = totals.getTotalCCPayments(budgetBreakdown);
    totalAvailableAfterUpcoming -= totalCCPayments;

    const $totalCCPayments = util.createBudgetBreakdownEntry(
      'total-cc-payments',
      'toolkit.totalCCPayments',
      'CC Payments',
      -totalCCPayments // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
    );
    $elements = $elements.add($totalCCPayments);
  }

  if (totalAvailableAfterUpcoming === totalAvailable) return;

  const $availableAfterUpcoming = util.createBudgetBreakdownEntry(
    'total-available-after-upcoming',
    'toolkit.availableAfterUpcoming',
    'Available After Upcoming Transactions',
    totalAvailableAfterUpcoming
  );
  $elements = $elements.add($availableAfterUpcoming);

  $elements = $elements.add('<div id="available-after-upcoming-hr"><hr style="width:100%"></div>');

  const $totalAvailableAfterSavings = $('#total-available-after-savings');
  const $ynabBreakdown = $('.ynab-breakdown', context);

  if (ynabToolKit.options.ShowAvailableAfterSavings && $totalAvailableAfterSavings.length)
    $elements.insertAfter($totalAvailableAfterSavings);
  else $elements.prependTo($ynabBreakdown);
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
