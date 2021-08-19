import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteBudgetPage, getSelectedMonth } from 'toolkit/extension/utils/ynab';

export function shouldRun() {
  // Upcoming transactions can only exist in current or future months.
  const selectedMonth = getSelectedMonth();
  const currentMonth = ynab.utilities.DateWithoutTime.createForCurrentMonth();
  return isCurrentRouteBudgetPage() && !selectedMonth.isBeforeMonth(currentMonth);
}

export function getCurrencyClass(amount) {
  let currencyClass = 'positive';

  if (amount < 0) {
    currencyClass = 'negative';
  } else if (amount === 0) {
    currencyClass = 'zero';
  }

  return currencyClass;
}

export function createBudgetBreakdownEntry(elementId, l10nKey, l10nDefault, amount) {
  const title = l10n(l10nKey, l10nDefault);

  const currencyClass = getCurrencyClass(amount);
  amount = formatCurrency(amount);

  return $(`
    <div id="${elementId}">
      <div>${title}</div>
      <div class="user-data">
        <span class="user-data currency ${currencyClass}">${amount}</span>
      </div>
    </div>
  `);
}

export function createInspectorMessageEntry(elementId, l10nKey, l10nDefault, amount) {
  const title = l10n(l10nKey, l10nDefault);

  const currencyClass = getCurrencyClass(amount);
  amount = formatCurrency(amount);

  return $(`
    <div id="${elementId}" class="inspector-message-row">
      <div class="inspector-message-label">${title}</div>
      <div class="inspector-message-currency">
        <span class="user-data currency ${currencyClass}">${amount}</span>
      </div>
    </div>
  `);
}

export function $buildEntries(entries) {
  let $entries = $();
  for (const entry of entries) {
    $entries = $entries.add(entry);
  }
  return $entries;
}
