/* eslint-disable no-continue */
import { formatCurrency, getCurrencyClass } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getBudgetService } from 'toolkit/extension/utils/ynab';
import * as categories from './categories';
import { removeBudgetBreakdownEntries } from './destroy-helpers';
import { shouldRun } from './index';

export function handleBudgetBreakdownMonthlyTotals() {
  // Remove budget breakdown entries if they exist.
  removeBudgetBreakdownEntries();

  if (!shouldRun()) return;

  const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals');
  if (!$budgetBreakdownMonthlyTotals.length) return;

  const inspectorCategories = getBudgetService()?.inspectorCategories;
  if (!inspectorCategories) return;

  const totals = categories.getTotals(inspectorCategories);
  if (!totals) return;

  setBudgetBreakdown(totals, $budgetBreakdownMonthlyTotals);
}

function setBudgetBreakdown(totals, context) {
  const totalPreviousUpcoming = totals.totalPreviousUpcoming;
  const totalUpcoming = totals.totalUpcoming;
  const totalCCPayments = totals.totalCCPayments;
  const totalAvailableAfterUpcoming = totals.totalAvailableAfterUpcoming;

  setBudgetBreakdownEntries();

  if (totalPreviousUpcoming)
    budgetBreakdownEntries.totalPreviousUpcoming.amount = totalPreviousUpcoming;

  budgetBreakdownEntries.totalUpcoming.amount = totalUpcoming;

  if (totalCCPayments) budgetBreakdownEntries.totalCCPayments.amount = -totalCCPayments; // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.

  budgetBreakdownEntries.totalAvailableAfterUpcoming.amount = totalAvailableAfterUpcoming;

  let $budgetBreakdownEntries = getBudgetBreakdownEntries(budgetBreakdownEntries);

  $budgetBreakdownEntries = $budgetBreakdownEntries.add(
    $('<div id="tk-available-after-upcoming-hr"><hr style="width:100%"></div>')
  );

  const $totalAvailableAfterSavings = $('#tk-total-available-after-savings', context);
  const $ynabBreakdown = $('.ynab-breakdown', context);

  if (ynabToolKit.options.ShowAvailableAfterSavings && $totalAvailableAfterSavings.length)
    $budgetBreakdownEntries.insertAfter($totalAvailableAfterSavings);
  else $budgetBreakdownEntries.prependTo($ynabBreakdown);
}

export function getBudgetBreakdownEntries(entries) {
  let $entries = $();

  for (const entry of Object.values(entries)) {
    if (entry.amount === null) continue;

    const currencyClass = getCurrencyClass(entry.amount);
    const amount = formatCurrency(entry.amount);

    $entries = $entries.add(
      $(`
        <div id="${entry.elementId}" class="inspector-message-row">
          <div class="inspector-message-label">${entry.title}</div>
          <div class="inspector-message-currency">
            <span class="user-data currency ${currencyClass}">${amount}</span>
          </div>
        </div>
      `)
    );
  }

  return $entries;
}

const budgetBreakdownEntries = {};

function setBudgetBreakdownEntries() {
  budgetBreakdownEntries.totalPreviousUpcoming = {
    elementId: 'tk-total-previous-upcoming',
    title: l10n('toolkit.totalPreviousUpcoming', 'Upcoming Transactions (Previous Months)'),
    amount: null,
  };

  budgetBreakdownEntries.totalUpcoming = {
    elementId: 'tk-total-upcoming',
    title: l10n('toolkit.totalUpcoming', 'Upcoming Transactions (This Month)'),
    amount: null,
  };

  budgetBreakdownEntries.totalCCPayments = {
    elementId: 'tk-total-cc-payments',
    title: l10n('toolkit.totalCCPayments', 'Credit Card Payments'),
    amount: null,
  };

  budgetBreakdownEntries.totalAvailableAfterUpcoming = {
    elementId: 'tk-total-available-after-upcoming',
    title: l10n('toolkit.availableAfterUpcoming', 'Available After Upcoming Transactions'),
    amount: null,
  };
}
