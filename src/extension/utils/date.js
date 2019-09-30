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
  return getEntityManager()
    .getFirstMonthForBudget()
    .clone();
}

export function localizedMonthAndYear(date, style = MonthStyle.Long) {
  const month = date.getMonth();
  return `${l10nMonth(month, style)} ${date.getYear()}`;
}

export function sortByGettableDate(a, b) {
  const dateA = a.get('date');
  const dateB = b.get('date');

  if (dateA.isBefore(dateB)) {
    return -1;
  }
  if (dateA.isAfter(dateB)) {
    return 1;
  }

  return 0;
}

/**
 * Determine if a given date is between two dates
 * Note: Filtered boundaries are the date before the month and the first of the month
 *       Not the first of the month and end of month
 *
 * @param {*} date The date to compare with
 * @param {*} startDate The start date to compare against
 * @param {*} endDate The end date to compare against
 * @returns True if date is between the two specified dates, false otherwise
 */
export function isBetween(date, startDate, endDate) {
  return date.isAfter(startDate) && date.isBefore(endDate);
}
function ynabDate(format) {
  if (typeof format !== 'string') {
    return ynab.YNABSharedLib.dateFormatter.formatDate();
  }

  return ynab.YNABSharedLib.dateFormatter.formatDate(moment(), format);
}
