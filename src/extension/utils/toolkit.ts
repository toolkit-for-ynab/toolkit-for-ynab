import type { YNABAccountType } from 'toolkit/types/ynab/window/ynab-enums';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const STORAGE_KEY_PREFIX = 'ynab-toolkit-';

export enum MonthStyle {
  Short,
  Long,
}

export function getToolkitStorageKey<T>(key: string, defaultValue?: T) {
  let serializedValue = localStorage.getItem(STORAGE_KEY_PREFIX + key);

  if (serializedValue === null || serializedValue === 'undefined') {
    return defaultValue;
  }

  try {
    return JSON.parse(serializedValue);
  } catch (e) {
    return defaultValue;
  }
}

export function setToolkitStorageKey(key: string, value: unknown) {
  return localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
}

export function removeToolkitStorageKey(key: string) {
  return localStorage.removeItem(STORAGE_KEY_PREFIX + key);
}

export function l10n(key: string, defaultValue: string) {
  return defaultValue;
}

export function l10nMonth(monthIndex: number, short = MonthStyle.Long) {
  if (short === MonthStyle.Short) {
    return l10n(`months.${MONTHS_SHORT[monthIndex]}`, MONTHS_SHORT[monthIndex]);
  }

  return l10n(`months.${MONTHS_LONG[monthIndex]}`, MONTHS_LONG[monthIndex]);
}

export function l10nAccountType(accountType: YNABAccountType) {
  switch (accountType) {
    case ynab.enums.AccountType.Checking:
      return l10n('Checking', 'Checking');
    case ynab.enums.AccountType.Savings:
      return l10n('Savings', 'Savings');
    case ynab.enums.AccountType.Cash:
      return l10n('Cash', 'Cash');
    case ynab.enums.AccountType.CreditCard:
      return l10n('CreditCard', 'Credit Card');
    case ynab.enums.AccountType.LineOfCredit:
      return l10n('LineOfCredit', 'Line of Credit');
    case ynab.enums.AccountType.Mortgage:
      return l10n('Mortgage', 'Mortgage');
    case ynab.enums.AccountType.StudentLoan:
      return l10n('StudentLoan', 'Student Loan');
    case ynab.enums.AccountType.PersonalLoan:
      return l10n('PersonalLoan', 'Personal Loan');
    case ynab.enums.AccountType.MedicalDebt:
      return l10n('MedicalDebt', 'Medical Debt');
    case ynab.enums.AccountType.OtherDebt:
      return l10n('OtherDebt', 'Other Debt');
    case ynab.enums.AccountType.OtherAsset:
      return l10n('OtherAsset', 'Asset (e.g. Investment)');
    case ynab.enums.AccountType.OtherLiability:
      return l10n('OtherLiability', 'Liability (e.g. Mortgage)');
  }
}
