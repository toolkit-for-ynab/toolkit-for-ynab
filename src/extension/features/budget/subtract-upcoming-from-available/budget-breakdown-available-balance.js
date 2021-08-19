import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import * as categories from './categories';
import * as util from './util';

// This file handles the case when YNAB provides its own available after upcoming when one category is selected.

export function handleBudgetBreakdownAvailableBalance(element) {
  if (!util.shouldRun()) return;

  const $budgetBreakdownAvailableBalance = $('.budget-breakdown-available-balance', element);
  if (!$budgetBreakdownAvailableBalance.length) return;

  const $ynabAvailableAfterUpcoming = getYnabAvailableAfterUpcoming(element);
  if (!$ynabAvailableAfterUpcoming.length) return;

  resetInspectorMessage();

  const budgetBreakdown = getEmberView(element.id);
  if (!budgetBreakdown) return;

  const totals = categories.getTotals(budgetBreakdown);
  if (!totals) return;

  updateInspectorMessage(totals, $ynabAvailableAfterUpcoming, $budgetBreakdownAvailableBalance);
}

export function resetInspectorMessage() {
  const $budgetBreakdownAvailableBalance = $('.budget-breakdown-available-balance');
  if (!$budgetBreakdownAvailableBalance.length) return;

  // Remove clones and show original elements.
  for (const [key, $object] of Object.entries($budgetBreakdownAvailableBalance.data())) {
    if (key.toLowerCase().includes('clone')) $object.remove();
    else $object.show();
  }

  $('#tk-inspector-message-previous-upcoming').remove();
  $('#tk-inspector-message-cc-payment').remove();
}

function updateInspectorMessage(totals, $ynabAvailableAfterUpcoming, context) {
  const totalPreviousUpcoming = totals.totalPreviousUpcoming;
  const totalCCPayments = totals.totalCCPayments;
  const totalAvailableAfterUpcoming = totals.totalAvailableAfterUpcoming;

  const $inspectorMessage = $ynabAvailableAfterUpcoming.closest('.inspector-message').parent();
  const $ynabBreakdown = $inspectorMessage.siblings('.ynab-breakdown');

  const clones = getClones({ $inspectorMessage, $ynabBreakdown }, context);
  const $inspectorMessageClone = clones.$inspectorMessageClone;
  const $ynabBreakdownClone = clones.$ynabBreakdownClone;

  $inspectorMessageClone.insertBefore($ynabBreakdown).css('margin-bottom', '.5rem');
  $ynabBreakdownClone.insertAfter($inspectorMessageClone).css('margin-bottom', '0rem');

  const $inspectorMessageContainer = $('.inspector-message', $inspectorMessageClone);
  const classes = 'positive zero negative';
  $inspectorMessageContainer.removeClass(classes);
  $inspectorMessageContainer.addClass(totalAvailableAfterUpcoming >= 0 ? 'positive' : 'negative');

  const $inspectorMessageRow = getYnabAvailableAfterUpcoming($inspectorMessageClone).parent();
  const $availableAfterUpcomingText = $('.user-data', $inspectorMessageRow);
  $availableAfterUpcomingText.text(formatCurrency(totalAvailableAfterUpcoming));
  $availableAfterUpcomingText.removeClass(classes);
  $availableAfterUpcomingText.addClass(util.getCurrencyClass(totalAvailableAfterUpcoming));

  const inspectorMessageEntries = [];
  if (totalPreviousUpcoming)
    inspectorMessageEntries.push(
      getInspectorMessageEntry('previousUpcoming', totalPreviousUpcoming)
    );
  if (totalCCPayments)
    inspectorMessageEntries.push(getInspectorMessageEntry('CCPayment', -totalCCPayments)); // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
  const $inspectorMessageEntries = util.$buildEntries(inspectorMessageEntries);

  $inspectorMessageEntries.insertBefore($inspectorMessageRow);
}

// Store the elements on context ($budgetBreakdownAvailableBalance) and hide them so we can easily revert changes on destroy().
function getClones($objects, context) {
  const clones = {};
  for (const [key, $object] of Object.entries($objects)) {
    context.data(key, $object);

    const cloneKey = `${key}Clone`;
    clones[cloneKey] = $object.clone();
    context.data(cloneKey, clones[cloneKey]);

    $object.hide();
  }
  return clones;
}

function getYnabAvailableAfterUpcoming(context) {
  const localizedMessageText = l10n(
    'inspector.availableMessage.afterUpcoming',
    'Available After Upcoming'
  );

  return $('.inspector-message-label', context).filter(function () {
    return this.innerText === localizedMessageText;
  });
}

function getInspectorMessageEntry(key, amount) {
  const entry = inspectorMessageEntries[key];
  return util.createInspectorMessageEntry(entry[0], entry[1], entry[2], amount);
}

const inspectorMessageEntries = {};

inspectorMessageEntries.previousUpcoming = [
  'tk-inspector-message-previous-upcoming',
  'toolkit.inspectorMessagePreviousUpcoming',
  'Upcoming Transactions (Previous Months)',
];

inspectorMessageEntries.CCPayment = [
  'tk-inspector-message-cc-payment',
  'toolkit.inspectorMessageCCPayment',
  'Remaining Payment',
];
