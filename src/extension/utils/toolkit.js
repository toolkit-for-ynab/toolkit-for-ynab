import {
  EMBER_COMPONENT_TOOLKIT_HOOKS,
  emberComponentToolkitHookKey,
} from 'toolkit/extension/ynab-toolkit';
import { componentLookup } from 'toolkit/extension/utils/ember';

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
const STORAGE_KEY_PREFIX = 'ynab-toolkit-';

export const MonthStyle = {
  Short: 0,
  Long: 1,
};

export function getToolkitStorageKey(key, defaultValue) {
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

export function setToolkitStorageKey(key, value) {
  return localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
}

export function removeToolkitStorageKey(key) {
  return localStorage.removeItem(STORAGE_KEY_PREFIX + key);
}

export function l10n(_key, defaultValue) {
  return defaultValue;
}

export function l10nMonth(monthIndex, short = MonthStyle.Long) {
  if (short === MonthStyle.Short) {
    return l10n(`months.${MONTHS_SHORT[monthIndex]}`, MONTHS_SHORT[monthIndex]);
  }

  return l10n(`months.${MONTHS_LONG[monthIndex]}`, MONTHS_LONG[monthIndex]);
}

export function l10nAccountType(accountType) {
  switch (ynab.enums.AccountType[accountType]) {
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
    case ynab.enums.AccountType.CarLoan:
      return l10n('CarLoan', 'Car Loan');
    case ynab.enums.AccountType.StudentLoan:
      return l10n('StudentLoan', 'Student Loan');
    case ynab.enums.AccountType.PersonalLoan:
      return l10n('PersonalLoan', 'Personal Loan');
    case ynab.enums.AccountType.ConsumerLoan:
      return l10n('ConsumerLoan', 'Consumer Loan');
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

export function addToolkitEmberHook(context, componentKey, lifecycleHook, fn, guard) {
  const component = componentLookup(componentKey);
  if (!component) {
    return;
  }

  const componentProto = Object.getPrototypeOf(component);
  if (!EMBER_COMPONENT_TOOLKIT_HOOKS.includes(lifecycleHook)) {
    return;
  }

  let hooks = componentProto[emberComponentToolkitHookKey(lifecycleHook)];
  if (!hooks) {
    hooks = [{ context, fn, guard }];
    componentProto[emberComponentToolkitHookKey(lifecycleHook)] = hooks;
  } else if (hooks && !hooks.some(({ fn: fnExists }) => fn === fnExists)) {
    hooks.push({ context, fn, guard });
  }

  ynabToolKit.hookedComponents.add(componentKey);
}

export function removeToolkitEmberHook(componentKey, lifecycleHook, fn) {
  const componentProto = Object.getPrototypeOf(componentLookup(componentKey));

  let hooks = componentProto[emberComponentToolkitHookKey(lifecycleHook)];
  if (hooks) {
    componentProto[emberComponentToolkitHookKey(lifecycleHook)] = hooks.filter(
      (hook) => hook.fn !== fn
    );
  }
}
