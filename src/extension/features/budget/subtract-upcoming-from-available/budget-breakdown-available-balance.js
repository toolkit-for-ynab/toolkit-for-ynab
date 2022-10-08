/* eslint-disable no-continue */
import { formatCurrency, getCurrencyClass } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getBudgetService } from 'toolkit/extension/utils/ynab';
import * as categories from './categories';
import { resetInspectorMessage } from './destroy-helpers';
import { setInspectorMessageOriginalValues } from './destroy-helpers';
import { shouldRun } from './index';

// This file handles the case when YNAB provides its own available after upcoming when one category is selected.

export function handleBudgetBreakdownAvailableBalance() {
  resetInspectorMessage();

  if (!shouldRun()) return;

  const $budgetBreakdownAvailableBalance = $('.budget-breakdown-available-balance');
  if (!$budgetBreakdownAvailableBalance.length) return;

  const $inspectorMessageObjects = getInspectorMessageObjects();
  if (!$inspectorMessageObjects) return;

  const inspectorCategories = getBudgetService()?.inspectorCategories;
  if (!inspectorCategories) return;

  const totals = categories.getTotals(inspectorCategories);
  if (!totals) return;

  inspectorMessageValues(totals, $inspectorMessageObjects);
}

function inspectorMessageValues(totals, $inspectorMessageObjects) {
  // Save values before they're changed so we can revert everything on destroy().
  setInspectorMessageOriginalValues($inspectorMessageObjects);

  const totalPreviousUpcoming = totals.totalPreviousUpcoming;
  const totalCCPayments = totals.totalCCPayments;
  const totalAvailableAfterUpcoming = totals.totalAvailableAfterUpcoming;

  setInspectorMessageEntries();

  if (totalPreviousUpcoming)
    inspectorMessageEntries.previousUpcoming.amount = totalPreviousUpcoming;

  if (totalCCPayments) inspectorMessageEntries.CCPayment.amount = -totalCCPayments; // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.

  const $inspectorMessageEntries = getInspectorMessageEntries(inspectorMessageEntries);

  const values = {
    $inspectorMessageObjects,
    reset: false,
    removeClasses: ['positive', 'zero', 'negative'],
    $inspectorMessageContainerClass: totalAvailableAfterUpcoming >= 0 ? 'positive' : 'negative',
    $availableAfterUpcomingText: formatCurrency(totalAvailableAfterUpcoming),
    $availableAfterUpcomingTextClass: getCurrencyClass(totalAvailableAfterUpcoming),
    $inspectorMessageEntries,
  };

  setInspectorMessageValues(values);
}

export function setInspectorMessageValues(values) {
  if (!values) return;

  const $inspectorMessageObjects = values.$inspectorMessageObjects;
  const $inspectorMessage = $inspectorMessageObjects.$inspectorMessage;
  const $ynabBreakdown = $inspectorMessageObjects.$ynabBreakdown;
  const $inspectorMessageContainer = $inspectorMessageObjects.$inspectorMessageContainer;
  const $availableAfterUpcomingRow = $inspectorMessageObjects.$availableAfterUpcomingRow;
  const $availableAfterUpcomingText = $inspectorMessageObjects.$availableAfterUpcomingText;

  if (!values.reset) {
    $inspectorMessage.insertBefore($ynabBreakdown).css('margin-bottom', '.5rem');
    $ynabBreakdown.css('margin-bottom', '0rem');
  } else {
    $inspectorMessage.insertAfter($ynabBreakdown).css('margin-bottom', '0rem');
    $ynabBreakdown.css('margin-bottom', '.5rem');
  }

  $inspectorMessageContainer.removeClass(values.removeClasses);
  $inspectorMessageContainer.addClass(values.$inspectorMessageContainerClass);

  $availableAfterUpcomingText.text(values.$availableAfterUpcomingText);
  $availableAfterUpcomingText.removeClass(values.removeClasses);
  $availableAfterUpcomingText.addClass(values.$availableAfterUpcomingTextClass);

  if (values.$inspectorMessageEntries)
    values.$inspectorMessageEntries.insertBefore($availableAfterUpcomingRow);
}

function getInspectorMessageObjects() {
  const localizedMessageText = l10n(
    'inspector.availableMessage.afterUpcoming',
    'Available After Upcoming'
  );

  const $ynabAvailableAfterUpcoming = $('.inspector-message-label').filter(function () {
    return this.innerText === localizedMessageText;
  });

  if (!$ynabAvailableAfterUpcoming.length) return;

  const $inspectorMessage = $ynabAvailableAfterUpcoming.closest('.inspector-message').parent();
  const $ynabBreakdown = $inspectorMessage.siblings('.ynab-breakdown');
  const $inspectorMessageContainer = $('.inspector-message', $inspectorMessage);
  const $availableAfterUpcomingRow = $ynabAvailableAfterUpcoming.parent();
  const $availableAfterUpcomingText = $('.user-data', $availableAfterUpcomingRow);

  return {
    $inspectorMessage,
    $ynabBreakdown,
    $inspectorMessageContainer,
    $availableAfterUpcomingRow,
    $availableAfterUpcomingText,
  };
}

function getInspectorMessageEntries(entries) {
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

const inspectorMessageEntries = {};

function setInspectorMessageEntries() {
  inspectorMessageEntries.previousUpcoming = {
    elementId: 'tk-inspector-message-previous-upcoming',
    title: l10n(
      'toolkit.inspectorMessagePreviousUpcoming',
      'Upcoming Transactions (Previous Months)'
    ),
    amount: null,
  };

  inspectorMessageEntries.CCPayment = {
    elementId: 'tk-inspector-message-cc-payment',
    title: l10n('toolkit.inspectorMessageCCPayment', 'Remaining Payment'),
    amount: null,
  };
}
