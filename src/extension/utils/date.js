import { l10nMonth, MonthStyle } from './toolkit';
import { getEntityManager } from './ynab';

export function getCurrentDate(format) {
  return ynabDate(format, false);
}

export function getToday() {
  const today = new ynab.utilities.DateWithoutTime();
  return today.clone();
}

export function getFirstMonthOfBudget() {
  return getEntityManager().getFirstMonthForBudget().clone();
}

export function localizedMonthAndYear(date) {
  const month = date.getMonth(MonthStyle.Short);
  return `${l10nMonth(month)} ${date.getYear()}`;
}

export function sortByTransactionDate(a, b) {
  const dateA = a.get('date');
  const dateB = b.get('date');

  if (dateA.isBefore(dateB)) {
    return -1;
  } else if (dateA.isAfter(dateB)) {
    return 1;
  }

  return 0;
}

function ynabDate(format) {
  if (typeof format !== 'string') {
    return ynab.YNABSharedLib.dateFormatter.formatDate();
  }

  return ynab.YNABSharedLib.dateFormatter.formatDate(moment(), format);
}
