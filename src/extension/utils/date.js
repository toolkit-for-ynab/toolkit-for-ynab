import { l10nMonth, MonthStyle } from './toolkit';
import { getEntityManager } from './ynab';

export function getCurrentDate(format) {
  return ynabDate(format, false);
}

export function getToday() {
  const today = ynab.utilities.DateWithoutTime.createForToday();
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
 * Note: Filters are last date of previous month to last date of current month
 *       IE: September will yield
 *           startDate: August 31st
 *           endDate: September 30th
 *
 * @param {*} date The date to compare with
 * @param {*} startDate The start date to compare against
 * @param {*} endDate The end date to compare against
 * @returns True if date is between the two specified dates, false otherwise
 */
export function isBetween(date, startDate, endDate) {
  // return (date.equalsDate(endDate) || date.isBefore(endDate)) && (date.isAfter(startDate) || date.equalsDate(startDate));
  let dateUTC = date;
  return dateUTC > startDate.getUTCTime() && dateUTC <= endDate.getUTCTime();
}

function ynabDate(format) {
  if (typeof format !== 'string') {
    return ynab.YNABSharedLib.dateFormatter.formatDate();
  }

  return ynab.YNABSharedLib.dateFormatter.formatDate(moment(), format);
}
